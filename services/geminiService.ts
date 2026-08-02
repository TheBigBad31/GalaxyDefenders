
// Service de Taunt (Provocation) - Mode Local (Sans IA)

const TAUNTS = {
  // Phrases pour les niveaux faibles ou moyens
  GENERIC: [
      "L'invasion est terminée. Les humains ont échoué.",
      "Si faible... Si pathétique.",
      "Retourne jouer à Pong, humain.",
      "Même ma grand-mère alien vise mieux.",
      "C'est tout ce que tu as dans le ventre ?",
      "Transmission interrompue. Tu as de la chance.",
      "Nos renforts arrivent. Profite de ce répit.",
      "GAME OVER. Tes efforts sont futiles.",
      "Tes réflexes sont aussi lents qu'une limace de l'espace.",
      "Hahahahaha ! Quelle explosion magnifique.",
      "C'était un tir d'entraînement, et tu as perdu.",
      "L'humanité est condamnée si tu es leur meilleur pilote."
  ],
  // Phrases pour les niveaux élevés (5+)
  HIGH_LEVEL: [
      "Pas mal pour un primate, mais insuffisant.",
      "Tu t'es bien battu, mais l'Empire gagne toujours.",
      "Une résistance futile, mais amusante.",
      "Presque impressionnant. Presque.",
      "Tu as retardé l'inévitable.",
      "Enfin un adversaire digne de ce nom.",
      "Nous reviendrons plus nombreux.",
      "Ton vaisseau est en cendres, mais tu as mon respect."
  ],
  // Phrases spécifiques collision
  KAMIKAZE: [
      "Boum ! T'as pas vu le Kamikaze ?",
      "Tu aimes faire des câlins à nos vaisseaux ?",
      "Collision détectée. Intelligence non détectée.",
      "Nos pilotes suicide te remercient.",
      "Attention à la peinture !"
  ]
};

export const generateAlienTaunt = async (score: number, level: number, killedBy: string): Promise<string> => {
  let pool = TAUNTS.GENERIC;

  // Logique de sélection du pool de phrases
  if (killedBy === 'kamikaze') {
      // 50% de chance d'avoir un taunt spécifique kamikaze si mort par collision
      if (Math.random() > 0.5) {
          pool = TAUNTS.KAMIKAZE;
      }
  } 
  
  if (pool === TAUNTS.GENERIC && level >= 5) {
      pool = TAUNTS.HIGH_LEVEL;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};
