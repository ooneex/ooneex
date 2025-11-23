import { ESessionType } from "./types";

export const SESSION_TYPES_EN = [
  {
    code: ESessionType.TRAINING,
    name: "Training",
    description:
      "Learning-focused session with detailed explanations and guided experience. Perfect for acquiring new knowledge and understanding complex concepts step by step.",
    color: "#3b82f6",
  },
  {
    code: ESessionType.PRACTICE,
    name: "Practice",
    description:
      "Reinforcement session for solidifying already learned knowledge. Helps strengthen understanding through repetition and application of learned concepts.",
    color: "#10b981",
  },
  {
    code: ESessionType.SIMULATION,
    name: "Simulation",
    description:
      "Mock test environment simulating real exam conditions. Provides realistic practice experience with authentic timing and pressure conditions.",
    color: "#f59e0b",
  },
  {
    code: ESessionType.QUIZ,
    name: "Quiz",
    description:
      "Quick knowledge check with immediate feedback. Short and focused sessions to assess current understanding and identify areas for improvement.",
    color: "#8b5cf6",
  },
  {
    code: ESessionType.CHALLENGE,
    name: "Challenge",
    description:
      "Competitive or difficult questions designed to test limits. Advanced sessions that push your knowledge boundaries and critical thinking skills.",
    color: "#ef4444",
  },
  {
    code: ESessionType.TOURNAMENT,
    name: "Tournament",
    description:
      "Multiplayer competitive session with rankings and prizes. Compete against other players in real-time for leaderboard positions and rewards.",
    color: "#f59e0b",
  },
  {
    code: ESessionType.REVIEW,
    name: "Review",
    description:
      "Session for revisiting previously answered questions and mistakes. Focused practice on areas where improvement is needed based on past performance.",
    color: "#6b7280",
  },
  {
    code: ESessionType.DIAGNOSTIC,
    name: "Diagnostic",
    description:
      "Initial assessment to identify knowledge gaps and skill levels. Comprehensive evaluation to create a personalized learning path.",
    color: "#06b6d4",
  },
  {
    code: ESessionType.SPEED_TEST,
    name: "Speed Test",
    description:
      "Time-pressured rapid-fire questions focusing on speed and accuracy. Develops quick thinking and decision-making skills under time constraints.",
    color: "#ec4899",
  },
] as const;

export const SESSION_TYPES_FR = [
  {
    code: ESessionType.TRAINING,
    name: "Formation",
    description:
      "Session d'apprentissage avec explications détaillées et expérience guidée. Parfait pour acquérir de nouvelles connaissances et comprendre des concepts complexes étape par étape.",
    color: "#3b82f6",
  },
  {
    code: ESessionType.PRACTICE,
    name: "Pratique",
    description:
      "Session de renforcement pour consolider les connaissances déjà apprises. Aide à renforcer la compréhension par la répétition et l'application des concepts appris.",
    color: "#10b981",
  },
  {
    code: ESessionType.SIMULATION,
    name: "Simulation",
    description:
      "Environnement d'examen simulé reproduisant les conditions réelles d'examen. Offre une expérience de pratique réaliste avec un timing et une pression authentiques.",
    color: "#f59e0b",
  },
  {
    code: ESessionType.QUIZ,
    name: "Quiz",
    description:
      "Contrôle rapide des connaissances avec feedback immédiat. Sessions courtes et ciblées pour évaluer la compréhension actuelle et identifier les domaines à améliorer.",
    color: "#8b5cf6",
  },
  {
    code: ESessionType.CHALLENGE,
    name: "Défi",
    description:
      "Questions compétitives ou difficiles conçues pour tester les limites. Sessions avancées qui repoussent vos limites de connaissances et vos compétences de pensée critique.",
    color: "#ef4444",
  },
  {
    code: ESessionType.TOURNAMENT,
    name: "Tournoi",
    description:
      "Session compétitive multijoueur avec classements et prix. Affrontez d'autres joueurs en temps réel pour des positions au classement et des récompenses.",
    color: "#f59e0b",
  },
  {
    code: ESessionType.REVIEW,
    name: "Révision",
    description:
      "Session pour revoir les questions précédemment répondues et les erreurs. Pratique ciblée sur les domaines nécessitant une amélioration basée sur les performances passées.",
    color: "#6b7280",
  },
  {
    code: ESessionType.DIAGNOSTIC,
    name: "Diagnostic",
    description:
      "Évaluation initiale pour identifier les lacunes de connaissances et les niveaux de compétences. Évaluation complète pour créer un parcours d'apprentissage personnalisé.",
    color: "#06b6d4",
  },
  {
    code: ESessionType.SPEED_TEST,
    name: "Test de Vitesse",
    description:
      "Questions rapides sous pression temporelle axées sur la vitesse et la précision. Développe la pensée rapide et les compétences de prise de décision sous contraintes de temps.",
    color: "#ec4899",
  },
] as const;

export const SESSION_TYPES_RO = [
  {
    code: ESessionType.TRAINING,
    name: "Antrenament",
    description:
      "Sesiune de învățare cu explicații detaliate și experiență ghidată. Perfect pentru dobândirea de cunoștințe noi și înțelegerea conceptelor complexe pas cu pas.",
    color: "#3b82f6",
  },
  {
    code: ESessionType.PRACTICE,
    name: "Practică",
    description:
      "Sesiune de consolidare pentru solidificarea cunoștințelor deja învățate. Ajută la consolidarea înțelegerii prin repetiție și aplicarea conceptelor învățate.",
    color: "#10b981",
  },
  {
    code: ESessionType.SIMULATION,
    name: "Simulare",
    description:
      "Mediu de testare simulat care reproduce condițiile reale de examen. Oferă o experiență de practică realistă cu timp și presiune autentice.",
    color: "#f59e0b",
  },
  {
    code: ESessionType.QUIZ,
    name: "Quiz",
    description:
      "Verificare rapidă a cunoștințelor cu feedback imediat. Sesiuni scurte și focalizate pentru a evalua înțelegerea actuală și a identifica domeniile de îmbunătățit.",
    color: "#8b5cf6",
  },
  {
    code: ESessionType.CHALLENGE,
    name: "Provocare",
    description:
      "Întrebări competitive sau dificile concepute pentru a testa limitele. Sesiuni avansate care îți împing limitele cunoștințelor și abilitățile de gândire critică.",
    color: "#ef4444",
  },
  {
    code: ESessionType.TOURNAMENT,
    name: "Turneu",
    description:
      "Sesiune competitivă multiplayer cu clasamente și premii. Concurează cu alți jucători în timp real pentru poziții în clasament și recompense.",
    color: "#f59e0b",
  },
  {
    code: ESessionType.REVIEW,
    name: "Recapitulare",
    description:
      "Sesiune pentru revizuirea întrebărilor răspunse anterior și greșelilor. Practică focalizată pe domeniile care necesită îmbunătățire pe baza performanțelor anterioare.",
    color: "#6b7280",
  },
  {
    code: ESessionType.DIAGNOSTIC,
    name: "Diagnostic",
    description:
      "Evaluare inițială pentru identificarea lacunelor de cunoștințe și nivelurilor de competențe. Evaluare cuprinzătoare pentru crearea unei căi de învățare personalizate.",
    color: "#06b6d4",
  },
  {
    code: ESessionType.SPEED_TEST,
    name: "Test de Viteză",
    description:
      "Întrebări rapide sub presiunea timpului, axate pe viteză și acuratețe. Dezvoltă gândirea rapidă și abilitățile de luare a deciziilor sub constrângeri de timp.",
    color: "#ec4899",
  },
] as const;
