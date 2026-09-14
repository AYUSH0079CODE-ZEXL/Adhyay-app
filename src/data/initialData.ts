import {
  UserProfile,
  StudyMaterial,
  Question,
  DoubtPost,
  DailyMission,
  Badge,
  KnowledgeNode,
} from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'user_aarav_101',
  name: 'Aarav Sharma',
  username: 'aarav_sharma',
  friendCode: 'ADHYAY-7482',
  email: 'aarav.sharma.edu@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  educationType: 'school',
  boardOrExam: 'CBSE Board',
  classGrade: 'Class 12',
  stream: 'Science (PCM + CS)',
  subjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'English Core'],
  targetExam: 'CBSE Class 12 Boards & JEE Main 2025',
  targetExamDate: '2025-02-15',
  xp: 1840,
  level: 8,
  streakDays: 6,
  lastActiveDate: new Date().toISOString().split('T')[0],
  todayStudyMinutes: 45,
  weakTopics: ['Electromagnetic Induction', 'Nernst Equation Calculations', 'Integration by Parts'],
  strongTopics: ['Current Electricity', 'Chemical Kinetics', 'Matrices & Determinants'],
  badges: [
    {
      id: 'b1',
      icon: '🧠',
      name: 'Concept Crusher',
      description: 'Mastered 10 core concepts with 90%+ in active recall.',
      unlockedAt: '2024-11-10',
      category: 'mastery',
    },
    {
      id: 'b2',
      icon: '🔥',
      name: '7-Day Streak',
      description: 'Studied consistently for 7 days in a row.',
      unlockedAt: '2024-11-14',
      category: 'streak',
    },
    {
      id: 'b3',
      icon: '⚡',
      name: 'Speed Solver',
      description: 'Solved 20 MCQs with average time under 45 seconds.',
      unlockedAt: '2024-11-18',
      category: 'accuracy',
    },
    {
      id: 'b4',
      icon: '🧑‍🏫',
      name: 'Helpful Student',
      description: 'Answered 5 community doubts and got 2 Best Answers.',
      unlockedAt: '2024-11-20',
      category: 'community',
    },
  ],
  privacy: {
    showProfileInDoubts: true,
    showStatsOnLeaderboard: true,
  },
};

export const INITIAL_DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'm1',
    title: 'Complete one focused study session',
    description: 'Study a topic or revise notes for at least 25 minutes.',
    xpReward: 50,
    isCompleted: true,
    progress: 1,
    target: 1,
    iconName: 'BookOpen',
  },
  {
    id: 'm2',
    title: 'Solve 10 practice questions',
    description: 'Attempt MCQs, PYQs, or numerical problems.',
    xpReward: 80,
    isCompleted: false,
    progress: 6,
    target: 10,
    iconName: 'CheckCircle2',
  },
  {
    id: 'm3',
    title: 'Revise 1 weak topic',
    description: 'Review formulas and common mistakes in your marked weak area.',
    xpReward: 60,
    isCompleted: false,
    progress: 0,
    target: 1,
    iconName: 'AlertTriangle',
  },
  {
    id: 'm4',
    title: 'Answer one peer doubt',
    description: 'Help a fellow student in the Doubts community.',
    xpReward: 70,
    isCompleted: false,
    progress: 0,
    target: 1,
    iconName: 'MessageSquare',
  },
  {
    id: 'm5',
    title: "Take today's 5-minute mini-test",
    description: 'Rapid 5-question test to reinforce retention.',
    xpReward: 100,
    isCompleted: false,
    progress: 0,
    target: 1,
    iconName: 'Zap',
  },
];

export const INITIAL_STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat_curr_elec',
    title: 'Current Electricity & Circuit Laws',
    type: 'generated_notes',
    subject: 'Physics',
    chapter: 'Chapter 3: Current Electricity',
    topic: 'Drift Velocity, Ohm Law, Kirchhoff Rules & Potentiometer',
    academicLevel: 'Class 12 / CBSE & JEE',
    summary: 'Master notes covering microscopic charge transport, temperature dependence of resistivity, Kirchhoff laws, Wheatstone bridge, and internal resistance.',
    createdAt: '2024-11-12T10:30:00Z',
    updatedAt: '2024-11-14T08:00:00Z',
    tags: ['Physics', 'Class 12', 'Circuits', 'High Priority', 'Board Exam'],
    isFavorite: true,
    notes: {
      complete: `# Current Electricity: Complete Academic Notes

## 1. Electric Current and Current Density
Electric current is defined as the time rate of flow of electric charge through any cross-section of a conductor:
$$I = \\frac{dQ}{dt}$$

### Current Density (Vector Formulation):
Current density $\\vec{J}$ is defined as current per unit area normal to the direction of flow:
$$\\vec{J} = \\frac{I}{A} \\hat{n}$$
Current is a scalar, but Current Density is a true vector.

## 2. Microscopic Mechanism & Drift Velocity
Conduction electrons in a metal undergo rapid thermal motion with speeds $\\sim 10^5 \\text{ m/s}$ in random directions, resulting in zero average thermal velocity:
$$\\langle \\vec{u} \\rangle = 0$$

When an external electric field $\\vec{E}$ is applied, each electron experiences an electric force $\\vec{F} = -e\\vec{E}$ and acceleration $\\vec{a} = -\\frac{e\\vec{E}}{m}$.
The average velocity with which electrons drift opposite to the field is the **Drift Velocity** ($v_d$):
$$v_d = \\frac{e E \\tau}{m}$$
where $\\tau$ is the relaxation time (mean free time between successive collisions with lattice ions).

### Fundamental Relation:
$$I = n e A v_d$$
where $n$ is electron number density (electrons/m³), $e = 1.6 \\times 10^{-19} \\text{ C}$, $A$ is cross-sectional area.

## 3. Ohm's Law and Resistivity
From $I = n e A \\left(\\frac{e E \\tau}{m}\\right) = \\left(\\frac{n e^2 \\tau}{m}\\right) A \\frac{V}{l}$, we obtain:
$$V = \\left(\\frac{m}{n e^2 \\tau} \\frac{l}{A}\\right) I = R I$$
where:
$$\\text{Resistivity } \\rho = \\frac{m}{n e^2 \\tau}, \\quad \\text{Conductivity } \\sigma = \\frac{1}{\\rho} = \\frac{n e^2 \\tau}{m}$$

### Vector Form of Ohm's Law:
$$\\vec{J} = \\sigma \\vec{E} = \\frac{\\vec{E}}{\\rho}$$

## 4. Temperature Dependence of Resistivity
$$\\rho_T = \\rho_0 [1 + \\alpha(T - T_0)]$$
- **Metals:** As $T \\uparrow$, lattice vibrations increase $\\implies \\tau \\downarrow \\implies \\rho \\uparrow$ (Positive $\\alpha$).
- **Semiconductors (Si, Ge):** As $T \\uparrow$, covalent bonds break exponentially $\\implies n \\uparrow \\uparrow \\implies \\rho \\downarrow$ (Negative $\\alpha$).
- **Nichrome / Constantan / Manganin:** Extremely small $\\alpha$ and high resistivity, hence used to make standard resistance coils and potentiometer wires.

## 5. Kirchhoff's Laws (Circuit Analysis)
1. **Junction Rule (KCL):** $\\sum I = 0$ at any node. (**Law of Conservation of Charge**).
2. **Loop Rule (KVL):** $\\sum \\Delta V = 0$ along any closed loop. (**Law of Conservation of Energy**).

## 6. Wheatstone Bridge Condition
For a balanced Wheatstone bridge with resistors $P, Q, R, S$:
$$\\frac{P}{Q} = \\frac{R}{S} \\implies I_{\\text{galvanometer}} = 0$$`,
      easy: `### Easy Explanation: How to Visualize Current Electricity

Think of an electrical circuit as **people walking through a crowded railway station (like Dadar in Mumbai)**:
1. **Voltage (V):** The loud announcement calling a train — it provides the push/motivation for people to move.
2. **Current (I):** The number of people passing the station gate every second.
3. **Resistance (R):** The narrow stairs and pillars slowing commuters down.
4. **Drift Velocity (v_d):** Even though people are jogging frantically in random directions (thermal speed), their net forward progression toward the platform is very slow (only 0.1 mm per second!).

### Two Golden Exam Rules:
- **Kirchhoff's 1st Law (KCL):** What enters a station platform must exit it. People cannot disappear into thin air. (Conservation of Charge).
- **Kirchhoff's 2nd Law (KVL):** If you take a full walking round-trip inside the station and return to the main entrance, your net height change is exactly zero. (Conservation of Energy).`,
      revision: `⚡ Quick High-Yield Summary:
• $I = n e A v_d = dQ/dt$
• $v_d = (e E \\tau)/m$
• $\\vec{J} = \\sigma \\vec{E} = \\vec{E}/\\rho$
• $R = \\rho l / A = \\frac{m l}{n e^2 \\tau A}$
• Metals: $\\alpha > 0$ (Resistance increases with heat)
• Semiconductors: $\\alpha < 0$ (Resistance decreases with heat)
• KCL = Conservation of Charge
• KVL = Conservation of Energy
• Balanced Wheatstone: $P/Q = R/S$
• Cell Terminal Voltage: $V = E - Ir$ (discharging), $V = E + Ir$ (charging)`,
      ultraQuick: `🚀 60-Second Exam Hall Booster:
1. Current I = neAv_d
2. Resistivity ρ = m / (n e² τ) [Independent of dimensions, depends only on material & temp]
3. Stretched wire (length doubled) -> Resistance becomes 4R (volume stays constant)
4. KCL = Charge conservation | KVL = Energy conservation
5. Potentiometer null method draws zero current from cell (ideal measurement)`,
      formulaSheet: [
        {
          formula: "I = n e A v_d",
          description: "Current in terms of electron drift velocity",
          symbols: "I = current (A), n = carrier density (m⁻³), e = 1.6×10⁻¹⁹ C, A = area (m²), v_d = drift velocity (m/s)",
          units: "Amperes (A)",
          conditions: "Uniform cross-section, steady current",
          whenToUse: "When microscopic electron parameters or wire diameter are given",
        },
        {
          formula: "R = ρ (l / A)",
          description: "Electrical resistance of a uniform conductor",
          symbols: "R = resistance (Ω), ρ = resistivity (Ω·m), l = length (m), A = cross-sectional area (m²)",
          units: "Ohms (Ω)",
          conditions: "Constant temperature, homogeneous material",
          whenToUse: "When conductor geometry (length, radius, thickness) is changed",
        },
        {
          formula: "E_eq = (E1/r1 + E2/r2) / (1/r1 + 1/r2)",
          description: "Equivalent EMF of two cells in parallel",
          symbols: "E1, E2 = individual EMFs, r1, r2 = internal resistances",
          units: "Volts (V)",
          conditions: "Cells connected in parallel with matching polarities",
          whenToUse: "Solving parallel battery networks without setting up multiple loop equations",
        },
      ],
      definitions: [
        {
          term: "Drift Velocity",
          definition: "The average steady velocity acquired by free conduction electrons in a conductor opposite to the applied external electric field.",
          importance: "Mandatory 1-mark / 2-mark question in Class 12 Boards and State Boards.",
        },
        {
          term: "Relaxation Time (τ)",
          definition: "The average time interval elapsed between two successive collisions of a conduction electron with the vibrating lattice ions.",
          importance: "Crucial for explaining the temperature coefficient of resistivity.",
        },
      ],
      derivations: [
        {
          title: "Derivation of I = neAv_d",
          steps: [
            "Consider a conductor of length 'l' and cross-sectional area 'A'.",
            "Total volume = A × l.",
            "Total number of free electrons N = n × A × l.",
            "Total charge Q = N × e = n A l e.",
            "Time taken to cross length l is t = l / v_d.",
            "Current I = Q / t = (n A l e) / (l / v_d) = n e A v_d.",
          ],
          keyTakeaway: "Current is directly proportional to drift speed, cross-section area, and electron density.",
        },
      ],
      examples: [
        {
          problem: "A wire of resistance 16 Ω is melted and drawn into a wire of half its original radius. Calculate the new resistance.",
          solution: "Since volume is constant: V = A1 × l1 = A2 × l2.\nRadius r2 = r1/2 => Area A2 = π(r1/2)² = A1/4.\nTherefore length l2 = 4 × l1.\nNew Resistance R2 = ρ l2 / A2 = ρ (4 l1) / (A1 / 4) = 16 (ρ l1 / A1) = 16 × R1 = 16 × 16 = 256 Ω.",
          examTip: "When radius changes by factor 'k', resistance changes by factor 1/k⁴!",
        },
      ],
      commonMistakes: [
        {
          mistake: "Saying resistance doubles when wire is stretched to double its length.",
          whyWrong: "When a wire is stretched, its volume stays constant, so area halves while length doubles.",
          correctWay: "New resistance R' = 4R. Always account for simultaneous decrease in cross-sectional area.",
        },
      ],
      exceptions: [
        {
          rule: "Ohm's Law: Current is proportional to Voltage (V = IR)",
          exception: "Non-Ohmic conductors like p-n junction diodes, vacuum tubes, and electrolytes have non-linear I-V curves.",
          examCaution: "Never apply V = IR to semiconductor devices without dynamic resistance calculation.",
        },
      ],
      diagrams: [
        {
          title: "Wheatstone Bridge Circuit Network",
          description: "Four resistors P, Q, R, S connected in a diamond quadrilateral with a sensitive galvanometer across the central diagonal and battery across the other.",
          keyLabels: ["Resistors P, Q, R, S", "Galvanometer G", "Null Deflection Ig = 0", "Battery EMF E", "Key K"],
        },
      ],
    },
    flashcards: [
      {
        id: 'fc1',
        front: 'State Kirchhoff’s Junction Rule (KCL) and its conservation basis.',
        back: 'The algebraic sum of currents meeting at any electrical node is zero (ΣI = 0). It is based on the Law of Conservation of Charge.',
        type: 'definition',
        subject: 'Physics',
        chapter: 'Current Electricity',
        masteryLevel: 4,
      },
      {
        id: 'fc2',
        front: 'What is the relation between Resistance and wire stretching (length n-fold)?',
        back: 'When a wire is stretched such that new length l’ = n·l, its new resistance R’ = n²·R (since volume is conserved, area becomes A/n).',
        type: 'formula',
        subject: 'Physics',
        chapter: 'Current Electricity',
        masteryLevel: 5,
      },
    ],
  },
  {
    id: 'mat_chem_nernst',
    title: 'Electrochemistry & Nernst Equation',
    type: 'generated_notes',
    subject: 'Chemistry',
    chapter: 'Chapter 2: Electrochemistry',
    topic: 'Galvanic Cells, Standard Hydrogen Electrode, Nernst Equation & Gibbs Energy',
    academicLevel: 'Class 12 / CBSE, NEET & JEE',
    summary: 'Complete breakdown of cell potentials, standard electrode potentials, Nernst equation for half-cells & full cells, Kohlrausch law, and battery types.',
    createdAt: '2024-11-10T14:20:00Z',
    updatedAt: '2024-11-13T09:15:00Z',
    tags: ['Chemistry', 'Class 12', 'Physical Chemistry', 'High Yield'],
    isFavorite: true,
    notes: {
      complete: `# Electrochemistry: Complete Academic Notes

## 1. Galvanic Cells & Cell Notation
A Galvanic (or Voltaic) cell converts chemical energy released in a spontaneous redox reaction into electrical energy.
Example (Daniell Cell):
$$\\text{Zn}(s) + \\text{Cu}^{2+}(aq) \\longrightarrow \\text{Zn}^{2+}(aq) + \\text{Cu}(s)$$
- **Anode (Oxidation):** $\\text{Zn}(s) \\longrightarrow \\text{Zn}^{2+}(aq) + 2e^-$ (Negative terminal, LOAN mnemonic: Left, Oxidation, Anode, Negative).
- **Cathode (Reduction):** $\\text{Cu}^{2+}(aq) + 2e^- \\longrightarrow \\text{Cu}(s)$ (Positive terminal).
- **Cell Representation:** $\\text{Zn}(s) | \\text{Zn}^{2+}(c_1) \\parallel \\text{Cu}^{2+}(c_2) | \\text{Cu}(s)$

## 2. Standard Cell Potential
$$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = E^\\circ_{\\text{right}} - E^\\circ_{\\text{left}}$$
*(Both must be Standard Reduction Potentials)*

## 3. The Nernst Equation
For a general redox reaction:
$$aA + bB \\xrightleftharpoons{ne^-} cC + dD$$
The cell potential at any non-standard concentration and temperature $T = 298 \\text{ K}$ is given by:
$$E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{2.303 RT}{n F} \\log_{10} Q = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n} \\log_{10} \\left( \\frac{[C]^c [D]^d}{[A]^a [B]^b} \\right)$$
where:
- $n$ = Number of moles of electrons transferred in balanced equation
- $F$ = Faraday constant ($96487 \\approx 96500 \\text{ C/mol}$)
- $Q$ = Reaction quotient (pure solids/liquids have activity = 1)

## 4. Equilibrium Constant and Gibbs Free Energy
At equilibrium: $E_{\\text{cell}} = 0$ and $Q = K_c$:
$$E^\\circ_{\\text{cell}} = \\frac{0.0591}{n} \\log_{10} K_c$$
$$\\Delta G^\\circ = -n F E^\\circ_{\\text{cell}} = -2.303 RT \\log_{10} K_c$$
For a spontaneous cell reaction: $E^\\circ_{\\text{cell}} > 0 \\implies \\Delta G^\\circ < 0$.`,
      easy: `### Easy Explanation: How to Never Mess Up Electrochemistry

Think of a Galvanic cell like **two friends playing catch with an electron ball**:
1. **Zinc (Anode):** Loves throwing away electrons. This is **Oxidation**.
2. **Copper (Cathode):** Loves catching electrons. This is **Reduction**.
3. **Remember the LOAN rule:**
   - **L**eft
   - **O**xidation
   - **A**node
   - **N**egative
4. **The Nernst Equation is simply a reality check:**
   When you have lots of reactant ions, the cell pushes hard (high voltage). As products accumulate, the cell gets tired (voltage drops). When voltage hits 0 V, the battery is completely dead (equilibrium)!`,
      revision: `⚡ Quick High-Yield Formulae:
• $E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}$
• $E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n} \\log_{10} \\frac{[\\text{Products}]}{[\\text{Reactants}]}$ (at 298 K)
• $\\Delta G^\\circ = -n F E^\\circ_{\\text{cell}}$
• $\\log_{10} K_c = \\frac{n E^\\circ_{\\text{cell}}}{0.0591}$
• Molar Conductivity: $\\Lambda_m = \\frac{\\kappa \\times 1000}{M}$ (S·cm²·mol⁻¹)
• Kohlrausch's Law: $\\Lambda_m^\\circ = \\nu_+ \\lambda_+^\\circ + \\nu_- \\lambda_-^\\circ$`,
      ultraQuick: `🚀 60-Second Exam Hall Booster:
1. LOAN: Left, Oxidation, Anode, Negative
2. E°cell = E°cathode - E°anode (both reduction potentials)
3. Spontaneous reaction: E°cell > 0, ΔG° < 0
4. Pure solids like Cu(s) or Zn(s) have concentration = 1 in Nernst equation
5. Dilution increases molar conductivity for both weak and strong electrolytes`,
      formulaSheet: [
        {
          formula: "E_cell = E°_cell - (0.0591 / n) log Q",
          description: "Nernst equation for cell EMF at 298 K",
          symbols: "E_cell = cell EMF, E°_cell = standard EMF, n = moles of transferred e⁻, Q = reaction quotient",
          units: "Volts (V)",
          conditions: "Temperature = 25°C (298 K), dilute solutions",
          whenToUse: "Calculating electrode or cell potential when ion concentrations differ from 1 M",
        },
        {
          formula: "ΔG° = -n F E°_cell",
          description: "Standard Gibbs Free Energy change of cell reaction",
          symbols: "ΔG° = Gibbs energy (J/mol), n = electron count, F = 96500 C/mol, E°_cell = standard EMF",
          units: "Joules / mole (J/mol) or kJ/mol",
          conditions: "Standard state (1 M, 1 bar, 298 K)",
          whenToUse: "Determining spontaneity or equilibrium constant Kc",
        },
      ],
      definitions: [
        {
          term: "Standard Electrode Potential (E°)",
          definition: "The potential difference developed between the metal electrode and the solution containing its own ions of unit activity (1 M) at 298 K and 1 bar pressure.",
          importance: "Forms the basis of the entire electrochemical series.",
        },
        {
          term: "Kohlrausch's Law of Independent Migration of Ions",
          definition: "Limiting molar conductivity of an electrolyte can be represented as the sum of the individual contributions of the anion and cation of the electrolyte.",
          importance: "Frequently asked 2-mark law for calculating limiting molar conductivity of weak electrolytes.",
        },
      ],
      derivations: [],
      examples: [
        {
          problem: "Calculate the EMF of the cell: Mg(s) | Mg²⁺(0.001 M) || Cu²⁺(0.0001 M) | Cu(s). Given E°(Mg²⁺/Mg) = -2.37 V, E°(Cu²⁺/Cu) = +0.34 V.",
          solution: "1. E°cell = E°cathode - E°anode = 0.34 - (-2.37) = +2.71 V.\n2. Overall reaction: Mg + Cu²⁺ -> Mg²⁺ + Cu (n = 2).\n3. E_cell = E°cell - (0.0591 / 2) log ([Mg²⁺] / [Cu²⁺])\n4. log (10⁻³ / 10⁻⁴) = log (10) = 1.\n5. E_cell = 2.71 - (0.0591 / 2) × 1 = 2.71 - 0.0295 = 2.68 V.",
          examTip: "Always write the balanced cell reaction first to verify the value of 'n'!",
        },
      ],
      commonMistakes: [
        {
          mistake: "Placing pure solid metals like [Zn(s)] inside the log term of the Nernst equation.",
          whyWrong: "Activity of pure solids and pure liquids is taken as unity (1) by thermodynamic convention.",
          correctWay: "Only include aqueous ions (e.g. [Zn²⁺], [Ag⁺], [H⁺]) in the reaction quotient Q.",
        },
      ],
      exceptions: [],
      diagrams: [
        {
          title: "Daniell Cell with Salt Bridge",
          description: "Zinc electrode in ZnSO4 solution connected through a porous salt bridge (containing agar-agar + KCl) to a Copper electrode in CuSO4 solution.",
          keyLabels: ["Zinc Anode (-)", "Copper Cathode (+)", "Salt Bridge (KCl)", "Voltmeter", "Direction of Electron Flow (Zn -> Cu)"],
        },
      ],
    },
  },
  {
    id: 'mat_yt_optics',
    title: 'Ray Optics & Optical Instruments 1-Shot Lecture',
    type: 'youtube',
    subject: 'Physics',
    chapter: 'Chapter 9: Ray Optics',
    topic: 'Refraction, Prism, Lens Maker Formula & Telescope',
    academicLevel: 'Class 12 CBSE & JEE/NEET',
    sourceUrl: 'https://www.youtube.com/watch?v=sample_ray_optics',
    summary: 'Complete high-yield 1-shot lecture covering sign conventions, refraction at spherical surfaces, Lens Maker formula derivation, prism minimum deviation, compound microscope, and astronomical telescope.',
    createdAt: '2024-11-08T16:00:00Z',
    updatedAt: '2024-11-08T16:00:00Z',
    tags: ['Physics', 'YouTube', 'Optics', 'Derivations', 'Class 12'],
    isFavorite: false,
    videoChapters: [
      { timestamp: '00:00', seconds: 0, title: 'Introduction & Cartesian Sign Convention', summary: 'Crucial rules: all distances measured from optical center/pole, direction of incident light is positive.' },
      { timestamp: '08:45', seconds: 525, title: 'Refraction at Spherical Surfaces', summary: 'Derivation of n2/v - n1/u = (n2 - n1)/R for convex and concave refracting surfaces.' },
      { timestamp: '24:10', seconds: 1450, title: 'Lens Maker Formula Master Derivation', summary: 'Combining two refracting surfaces: 1/f = (n21 - 1)(1/R1 - 1/R2).' },
      { timestamp: '42:30', seconds: 2550, title: 'Prism Formula & Angle of Minimum Deviation', summary: 'Derivation of n = sin((A + Dm)/2) / sin(A/2) and ray diagram.' },
      { timestamp: '58:15', seconds: 3495, title: 'Compound Microscope & Astronomical Telescope', summary: 'Ray diagrams for normal adjustment and least distance of distinct vision (D = 25 cm).' },
      { timestamp: '1:18:00', seconds: 4680, title: 'Top 5 Board Exam Numerical Problems', summary: 'Solving actual 5-mark past year questions step-by-step.' },
    ],
    notes: {
      complete: `# Ray Optics: Comprehensive Lecture Notes

## 1. Lens Maker's Formula
$$\\frac{1}{f} = (n_{21} - 1) \\left( \\frac{1}{R_1} - \\frac{1}{R_2} \\right)$$
where $n_{21} = \\frac{n_{\\text{lens}}}{n_{\\text{medium}}}$.

### Crucial Behavior in Liquid:
- If a glass lens ($n = 1.5$) is placed in water ($n = 1.33$), its focal length **increases by 4 times** ($f_{\\text{water}} \\approx 4 f_{\\text{air}}$).
- If placed in a liquid of greater refractive index ($n_{\\text{liquid}} > n_{\\text{lens}}$), the nature of the lens reverses (convex behaves as concave!).

## 2. Refraction through Prism
For a prism of angle $A$:
$$A = r_1 + r_2, \\quad \\delta = (i + e) - A$$
At minimum deviation ($\\delta = D_m$): $i = e$ and $r_1 = r_2 = \\frac{A}{2}$.
$$n = \\frac{\\sin\\left(\\frac{A + D_m}{2}\\right)}{\\sin\\left(\\frac{A}{2}\\right)}$$

## 3. Optical Instruments (Magnifying Power)
- **Compound Microscope:**
  - Near point ($v = D$): $m = -\\frac{v_o}{u_o} \\left(1 + \\frac{D}{f_e}\\right)$
  - Normal adjustment (image at $\\infty$): $m = -\\frac{L}{f_o} \\left(\\frac{D}{f_e}\\right)$
- **Astronomical Telescope:**
  - Normal adjustment: $m = -\\frac{f_o}{f_e}$, Tube length $L = f_o + f_e$.`,
      easy: `### Easy Visual Guide to Ray Optics
1. **Lens Maker Formula:** Think of it like bending light in two stages — first surface curves it in, second surface pushes it further.
2. **Prism Minimum Deviation:** When light passes symmetrically inside the prism (parallel to the base), deviation is minimum!
3. **Telescope vs Microscope:**
   - **Microscope:** Tiny objective (to catch tiny objects close by), big eyepiece.
   - **Telescope:** Huge objective (to catch faint stars far away), small eyepiece.`,
      revision: `⚡ Quick High-Yield Formulae:
• $1/f = (n - 1)(1/R1 - 1/R2)$
• Lens Formula: $1/v - 1/u = 1/f$
• Mirror Formula: $1/v + 1/u = 1/f$
• Prism: $n = \\sin((A + D_m)/2) / \\sin(A/2)$
• Telescope Normal: $m = -f_o / f_e$, $L = f_o + f_e$`,
      ultraQuick: `🚀 60-Second Exam Hall Booster:
1. All distances measured from optical centre / pole
2. Glass lens in water: focal length quadruples
3. Concave mirror & concave lens always have negative focal length
4. Normal adjustment in telescope means final image is at infinity (relaxed eye)`,
      formulaSheet: [
        {
          formula: "1/f = (n_lens/n_med - 1)(1/R1 - 1/R2)",
          description: "Lens Maker Formula",
          symbols: "f = focal length, n_lens = lens index, n_med = surrounding medium index, R1, R2 = radii of curvature",
          units: "meters (m)",
          conditions: "Thin lens, paraxial rays",
          whenToUse: "Finding focal length when lens is immersed in liquid or fabricated with specific curvature",
        },
      ],
      definitions: [],
      derivations: [],
      examples: [],
      commonMistakes: [],
      exceptions: [],
      diagrams: [],
    },
    flashcards: [
      {
        id: 'fc_opt_1',
        front: 'What happens to the focal length of a convex glass lens when immersed in water?',
        back: 'Its focal length increases to approximately 4 times its value in air because the relative refractive index (n_glass / n_water) decreases.',
        type: 'concept',
        subject: 'Physics',
        chapter: 'Ray Optics',
        masteryLevel: 4,
      },
    ],
  },
];

export const INITIAL_DOUBTS: DoubtPost[] = [
  {
    id: 'doubt_1',
    authorId: 'user_priya_202',
    authorName: 'Priya Patel',
    authorGrade: 'Class 12 (CBSE)',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    subject: 'Physics',
    chapter: 'Current Electricity',
    title: 'Why is terminal voltage V < EMF E when a cell is discharging?',
    description: 'Can someone explain with a clear circuit diagram why V = E - Ir? Where does the lost volts (Ir) go?',
    createdAt: '2024-11-14T06:30:00Z',
    upvotes: 14,
    hasUpvoted: false,
    isResolved: true,
    tags: ['Physics', 'Circuits', 'Internal Resistance', 'Board Concept'],
    answers: [
      {
        id: 'ans_1',
        authorName: 'Aarav Sharma',
        authorGrade: 'Class 12 (CBSE)',
        isBestAnswer: true,
        text: `Hey Priya! Here is the clean physical explanation:

Inside any chemical cell, ions must physically migrate through the liquid electrolyte to reach the electrodes. The electrolyte offers friction/resistance to this ionic flow, which we call **Internal Resistance ($r$)**.

When current $I$ flows out of the battery:
1. Work done per unit charge by the chemical EMF = $E$.
2. Work lost overcoming electrolyte resistance inside the battery = $I \\times r$ (lost volts).
3. The remaining voltage available at the external terminals is:
$$V = E - I r$$

*(Note: When the cell is being RECHARGED by an external charger, current flows backwards into the positive terminal, making $V = E + I r$ !)*`,
        createdAt: '2024-11-14T07:15:00Z',
        upvotes: 19,
        formula: 'V = E - Ir',
      },
      {
        id: 'ans_2',
        authorName: 'Abhyas AI Tutor',
        authorGrade: 'AI Study Engine',
        isAI: true,
        text: `Verified Academic Answer:
- EMF ($E$) is the open-circuit potential difference when $I = 0$.
- Internal resistance ($r$) causes a voltage drop $\\Delta V_{\\text{internal}} = Ir$.
- By Kirchhoff's Voltage Law: $E - Ir - IR = 0 \\implies V = IR = E - Ir$.`,
        createdAt: '2024-11-14T06:35:00Z',
        upvotes: 8,
      },
    ],
  },
  {
    id: 'doubt_2',
    authorId: 'user_rohit_303',
    authorName: 'Rohit Verma',
    authorGrade: 'JEE 2025 Aspirant',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    subject: 'Chemistry',
    chapter: 'Electrochemistry',
    title: 'How to quickly find value of "n" in Nernst equation for complex redox reactions?',
    description: 'I always get confused when stoichiometric coefficients are like 2 Fe³⁺ + 3 I⁻. How do we count n for ΔG° = -nFE°?',
    createdAt: '2024-11-13T19:00:00Z',
    upvotes: 9,
    hasUpvoted: true,
    isResolved: false,
    tags: ['Chemistry', 'Nernst Equation', 'JEE Main', 'Redox'],
    answers: [
      {
        id: 'ans_3',
        authorName: 'Dr. Meera N.',
        authorGrade: 'Subject Mentor',
        isTeacher: true,
        text: `Here is the golden shortcut to find $n$:

Always write either the oxidation half-reaction OR the reduction half-reaction after balancing for atoms:
1. Look at Oxidation: $\\text{Sn}^{2+} \\longrightarrow \\text{Sn}^{4+} + 2e^-$ $\\implies n = 2$.
2. In $2 \\text{Fe}^{3+} + 2\\text{I}^- \\longrightarrow 2\\text{Fe}^{2+} + \\text{I}_2$:
   Each $\\text{Fe}^{3+}$ gains $1 e^-$, so 2 moles of $\\text{Fe}^{3+}$ gain $2 e^-$ $\\implies n = 2$.
3. Check: $2 \\text{I}^- \\longrightarrow \\text{I}_2 + 2e^-$ $\\implies 2$ electrons lost.
Total transferred electrons $n = 2$!`,
        createdAt: '2024-11-13T20:10:00Z',
        upvotes: 12,
      },
    ],
  },
];

export const INITIAL_PYQ_BANK: Question[] = [
  {
    id: 'pyq_cbse_2023_1',
    type: 'mcq',
    text: 'A steady current flows through a metallic conductor of non-uniform cross-section. The physical quantity which remains constant along the length of the conductor is:',
    options: ['Electric field', 'Current density', 'Drift speed', 'Current'],
    correctAnswer: 'Current',
    explanation: 'By the principle of conservation of charge, the rate of charge entering any cross-section per second must equal the rate of charge leaving. Hence, current I remains constant. Current density J = I/A and drift speed v_d = I/(neA) vary inversely with cross-sectional area.',
    hints: ['Think about conservation of charge.', 'Does charge pile up inside a wire when it narrows?'],
    marks: 1,
    difficulty: 'medium',
    pyqSource: 'CBSE Class 12 Board 2023 (Set 55/1/1)',
    isPyq: true,
    isHighPriority: true,
    subject: 'Physics',
    chapter: 'Current Electricity',
  },
  {
    id: 'pyq_jee_2024_1',
    type: 'numerical',
    text: 'In a Wheatstone bridge, the four resistance arms are P = 10 Ω, Q = 20 Ω, R = 30 Ω and S = 60 Ω. A battery of 6 V with negligible internal resistance is connected across the bridge. Calculate the current drawn from the battery.',
    correctAnswer: '0.3 A',
    explanation: 'Check balanced condition: P/Q = 10/20 = 1/2. R/S = 30/60 = 1/2. Since P/Q = R/S, the bridge is balanced and no current flows through the central galvanometer branch. Top branch resistance R_top = 10 + 20 = 30 Ω. Bottom branch resistance R_bot = 30 + 60 = 90 Ω. Total equivalent resistance R_eq = (30 × 90) / (30 + 90) = 2700 / 120 = 22.5 Ω. Total current I = V / R_eq = 6 / 22.5 = 0.267 A ≈ 0.27 A.',
    hints: ['Check if P/Q = R/S to see if central branch can be removed.', 'Combine top series branch and bottom series branch in parallel.'],
    stepByStepSolution: {
      given: 'P = 10 Ω, Q = 20 Ω, R = 30 Ω, S = 60 Ω, Battery V = 6 V',
      required: 'Total current I drawn from battery',
      formula: 'P/Q = R/S for balanced bridge; R_eq = (R_top × R_bot) / (R_top + R_bot); I = V / R_eq',
      substitution: 'R_top = 10+20=30 Ω, R_bot = 30+60=90 Ω, R_eq = (30×90)/(30+90) = 22.5 Ω',
      calculation: 'I = 6 / 22.5 = 0.267 A',
      finalAnswer: '0.267 A (or 4/15 A)',
      unit: 'Amperes (A)',
    },
    marks: 4,
    difficulty: 'medium',
    pyqSource: 'JEE Main 2024 (Jan 29 Shift 1)',
    isPyq: true,
    isHighPriority: true,
    subject: 'Physics',
    chapter: 'Current Electricity',
  },
  {
    id: 'pyq_neet_2023_1',
    type: 'mcq',
    text: 'The conductivity of a semiconductor increases with increase in temperature because:',
    options: [
      'Both number density of free charge carriers and relaxation time decrease',
      'Number density of free charge carriers increases exponentially while relaxation time decrease is minor',
      'Relaxation time increases significantly',
      'Both carrier density and relaxation time increase',
    ],
    correctAnswer: 'Number density of free charge carriers increases exponentially while relaxation time decrease is minor',
    explanation: 'In semiconductors, thermal energy breaks covalent bonds, creating electron-hole pairs. The carrier concentration n increases exponentially (n ∝ e^(-Eg/2kT)), which overwhelmingly dominates over any small decrease in relaxation time τ.',
    hints: ['What happens to covalent bonds in Silicon or Germanium when heated?'],
    marks: 4,
    difficulty: 'easy',
    pyqSource: 'NEET-UG 2023',
    isPyq: true,
    isHighPriority: true,
    subject: 'Physics',
    chapter: 'Current Electricity / Semiconductors',
  },
  {
    id: 'pyq_cbse_2022_chem',
    type: 'assertion_reason',
    text: 'Assertion (A): Limiting molar conductivity of a weak electrolyte cannot be determined directly by extrapolation of Λm vs √c graph.\nReason (R): For weak electrolytes, Λm increases very steeply at higher dilutions as degree of dissociation α approaches 1.',
    options: [
      'Both A and R are true and R is the correct explanation of A.',
      'Both A and R are true but R is NOT the correct explanation of A.',
      'A is true but R is false.',
      'A is false but R is true.',
    ],
    correctAnswer: 'Both A and R are true and R is the correct explanation of A.',
    explanation: 'For weak electrolytes, the graph of Λm versus √c becomes nearly asymptotic to the y-axis at infinite dilution, making it impossible to extrapolate to c = 0. Hence, Kohlrausch’s law is used instead.',
    hints: ['Recall Kohlrausch’s law purpose for acetic acid (CH3COOH).'],
    marks: 1,
    difficulty: 'medium',
    pyqSource: 'CBSE Class 12 Chemistry Term 2 (2022)',
    isPyq: true,
    isHighPriority: true,
    subject: 'Chemistry',
    chapter: 'Electrochemistry',
  },
];

export const INITIAL_KNOWLEDGE_NODES: KnowledgeNode[] = [
  {
    id: 'kn_1',
    label: 'Electric Charges & Fields',
    subject: 'Physics',
    chapter: 'Chapter 1',
    status: 'mastered',
    masteryPercentage: 94,
    subtopics: ['Coulomb Law', 'Electric Dipole', 'Gauss Law Applications'],
  },
  {
    id: 'kn_2',
    label: 'Electrostatic Potential & Capacitance',
    subject: 'Physics',
    chapter: 'Chapter 2',
    status: 'mastered',
    masteryPercentage: 88,
    subtopics: ['Equipotential Surfaces', 'Dielectrics in Capacitors', 'Energy Density'],
  },
  {
    id: 'kn_3',
    label: 'Current Electricity',
    subject: 'Physics',
    chapter: 'Chapter 3',
    status: 'mastered',
    masteryPercentage: 90,
    subtopics: ['Drift Velocity', 'Ohm Law', 'Kirchhoff Rules', 'Potentiometer'],
  },
  {
    id: 'kn_4',
    label: 'Moving Charges & Magnetism',
    subject: 'Physics',
    chapter: 'Chapter 4',
    status: 'learning',
    masteryPercentage: 68,
    subtopics: ['Biot-Savart Law', 'Ampere Circuital Law', 'Galvanometer Conversion'],
  },
  {
    id: 'kn_5',
    label: 'Electromagnetic Induction',
    subject: 'Physics',
    chapter: 'Chapter 6',
    status: 'weak',
    masteryPercentage: 42,
    subtopics: ['Faraday Law', 'Lenz Law Direction', 'Motional EMF', 'Self & Mutual Inductance'],
  },
  {
    id: 'kn_6',
    label: 'Solutions',
    subject: 'Chemistry',
    chapter: 'Chapter 1',
    status: 'mastered',
    masteryPercentage: 92,
    subtopics: ['Raoult Law', 'Colligative Properties', 'Van t Hoff Factor'],
  },
  {
    id: 'kn_7',
    label: 'Electrochemistry',
    subject: 'Chemistry',
    chapter: 'Chapter 2',
    status: 'weak',
    masteryPercentage: 54,
    subtopics: ['Nernst Equation', 'Kohlrausch Law', 'Batteries & Fuel Cells'],
  },
  {
    id: 'kn_8',
    label: 'Chemical Kinetics',
    subject: 'Chemistry',
    chapter: 'Chapter 3',
    status: 'mastered',
    masteryPercentage: 85,
    subtopics: ['Rate Laws', 'Arrhenius Equation', 'Pseudo First Order Reactions'],
  },
];
