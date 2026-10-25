export interface UserProfile {
  id: string;          // sub Google, identifiant unique ou email
  name: string;        // Nom complet / Callsign
  email?: string;      // Email Google
  picture?: string;    // URL avatar Google HD ou avatar généré
  isGuest: boolean;    // true si non connecté / GUEST PILOT
  provider?: 'sso_apphub' | 'google' | 'guest';
}

const STORAGE_KEY = 'galaxy_defenders_pilot_profile';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (notification?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

/**
 * Décode un JWT Google sans bibliothèque externe
 */
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('[authService] Erreur lors du décodage JWT:', e);
    return null;
  }
}

class AuthService {
  private currentUser: UserProfile | null = null;
  private listeners: Array<(user: UserProfile) => void> = [];
  private gisInitialized: boolean = false;

  constructor() {
    this.init();
  }

  private getDefaultGuest(): UserProfile {
    return {
      id: 'guest_pilot',
      name: 'GUEST PILOT',
      isGuest: true,
      provider: 'guest',
    };
  }

  private init() {
    // 1. Vérifier si un profil est déjà persisté en localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          this.currentUser = parsed;
        }
      } catch (e) {
        console.warn('[authService] Échec parsing profil sauvegardé:', e);
      }
    }

    // 2. Intercepter ?google_user= depuis AppHub
    this.checkSSOParam();

    // 3. Si aucun utilisateur, initialiser en mode GUEST PILOT
    if (!this.currentUser) {
      this.currentUser = this.getDefaultGuest();
    }
  }

  /**
   * Vérifie et consomme le paramètre d'URL ?google_user= provenant d'AppHub
   */
  public checkSSOParam(): UserProfile | null {
    if (typeof window === 'undefined') return null;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const googleUserParam = urlParams.get('google_user');

      if (googleUserParam) {
        let cleanName = decodeURIComponent(googleUserParam).trim();
        let email = cleanName.includes('@') ? cleanName : undefined;
        let displayName = email ? cleanName.split('@')[0] : cleanName;

        // Formater le pseudonyme proprement
        displayName = displayName.replace(/[^\w\s-]/gi, '').slice(0, 16).toUpperCase();
        if (!displayName) displayName = 'PILOT-SSO';

        const ssoProfile: UserProfile = {
          id: `sso_${email || displayName}`,
          name: displayName,
          email: email,
          picture: email
            ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`
            : undefined,
          isGuest: false,
          provider: 'sso_apphub',
        };

        this.setSession(ssoProfile);

        // Nettoyer l'URL sans recharger la page
        urlParams.delete('google_user');
        const remainingQuery = urlParams.toString();
        const newUrl = window.location.pathname + (remainingQuery ? `?${remainingQuery}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);

        return ssoProfile;
      }
    } catch (err) {
      console.warn('[authService] Erreur lors de la capture du SSO AppHub:', err);
    }

    return null;
  }

  public getCurrentUser(): UserProfile {
    return this.currentUser || this.getDefaultGuest();
  }

  public subscribe(listener: (user: UserProfile) => void): () => void {
    this.listeners.push(listener);
    listener(this.getCurrentUser());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const user = this.getCurrentUser();
    this.listeners.forEach((listener) => {
      try {
        listener(user);
      } catch (err) {
        console.error('[authService] Erreur listener:', err);
      }
    });
  }

  public setSession(profile: UserProfile) {
    this.currentUser = profile;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('[authService] Impossible de persister le profil:', e);
    }
    this.notify();
  }

  public logout() {
    this.currentUser = this.getDefaultGuest();
    try {
      localStorage.removeItem(STORAGE_KEY);
      if (window.google?.accounts?.id?.disableAutoSelect) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch (e) {
      console.warn('[authService] Erreur lors du logout:', e);
    }
    this.notify();
  }

  /**
   * Initialise le Google Identity Services SDK et lance l'Account Chooser
   */
  public initGoogleIdentity(clientId?: string) {
    if (typeof window === 'undefined' || !window.google?.accounts?.id) return;
    if (this.gisInitialized) return;

    const googleClientId =
      clientId ||
      ((import.meta as any)?.env?.VITE_GOOGLE_CLIENT_ID as string | undefined) ||
      '681788788915-4k84evq7o4jfs56evcqe4i77d12u6v2o.apps.googleusercontent.com'; // Default client ID AppHub

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: any) => {
          if (response && response.credential) {
            const payload = decodeJwt(response.credential);
            if (payload) {
              const profile: UserProfile = {
                id: payload.sub || `google_${Date.now()}`,
                name: (payload.name || payload.given_name || 'PILOT').toUpperCase(),
                email: payload.email,
                picture: payload.picture,
                isGuest: false,
                provider: 'google',
              };
              this.setSession(profile);
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      this.gisInitialized = true;
    } catch (e) {
      console.warn('[authService] Erreur init Google GIS:', e);
    }
  }

  /**
   * Déclenche le Google Account Chooser
   */
  public promptGoogleAccountChooser(clientId?: string) {
    if (typeof window === 'undefined') return;

    // Si Google SDK est disponible
    if (window.google?.accounts?.id) {
      this.initGoogleIdentity(clientId);
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('[authService] GIS prompt non affiché ou ignoré:', notification.getNotDisplayedReason?.());
          // Fallback : ouverture d'un prompt d'authentification simulation/OAuth si bloqué par le navigateur
          this.fallbackOAuthOrPrompt();
        }
      });
    } else {
      console.warn('[authService] Google Identity Services non disponible, ouverture du fallback.');
      this.fallbackOAuthOrPrompt();
    }
  }

  /**
   * Fallback convivial en cas d'absence de connectivité ou blocage iframe tiers
   */
  private fallbackOAuthOrPrompt() {
    const input = window.prompt("Connexion Pilote Google :\nEntrez votre adresse email ou pseudonyme Google :");
    if (input && input.trim()) {
      const clean = input.trim();
      const email = clean.includes('@') ? clean : `${clean.toLowerCase()}@gmail.com`;
      const name = clean.split('@')[0].toUpperCase().slice(0, 16);
      const profile: UserProfile = {
        id: `google_${Date.now()}`,
        name: name,
        email: email,
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        isGuest: false,
        provider: 'google',
      };
      this.setSession(profile);
    }
  }
}

export const authService = new AuthService();

