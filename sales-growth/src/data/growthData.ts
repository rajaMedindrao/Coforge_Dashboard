/**
 * Static demo data for the Account Growth tab: the top 20 strategic accounts.
 *
 * Only account inputs and opportunities are stored here. Every card, roll-up, projection and
 * talking point is computed from them in src/model. Names, Sales Leads, BU heads and Client
 * Partners come from the Sales tab data (sales-performance/src/data/staticData.ts) by account id.
 *
 * Units: money in USD thousands (a multiple of 10); percentages as whole numbers (35 = 35%).
 * FY27 runs Apr 2026 – Mar 2027; the current quarter is Q2 FY27 and the data is as of 9 Oct 2026.
 * Competitor names, wallet splits, market growth and product mapping are illustrative.
 */

export const AS_OF = '2026-10-09';

export const SERVICE_LINES = ['Digital Engineering', 'Data & AI', 'Cloud & Infra', 'Enterprise Apps', 'Quality Engineering'] as const;
export type ServiceLine = (typeof SERVICE_LINES)[number];

export const COMPETITORS = ['TCS', 'Infosys', 'Accenture', 'Cognizant', 'LTIMindtree'] as const;
export type Competitor = (typeof COMPETITORS)[number];
/** Who else is in a deal; "In-house" means the client's own IT team. */
export type Rival = Competitor | 'In-house';

export const OPPORTUNITY_TYPES = ['Renewal', 'Expansion', 'Cross-sell', 'New division/region', 'Competitor takeover'] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

/** Active = being pursued with a win %; Potential = identified, not yet active; Won/Lost = closed in the last 12 months. */
export type OpportunityStatus = 'Active' | 'Potential' | 'Won' | 'Lost';
export type Stage = 'Qualified' | 'Proposal' | 'Negotiation';
export const STAGES: readonly Stage[] = ['Qualified', 'Proposal', 'Negotiation'];
export type Strength = 'Strong' | 'Medium' | 'Weak';
export type Satisfaction = 'Low' | 'Medium' | 'High';

export const PRODUCTS = {
  'Coforge Quasar': 'enterprise AI platform',
  'Forge-X': 'AI-native engineering',
  CodeInsightAI: 'legacy modernisation',
  BlueSwan: 'quality engineering',
  'EvolveOps.AI': 'agentic IT operations',
  'Data Cosmos': 'data & analytics',
  AIVA: 'agentic software development',
  AgentSphere: 'AI agent governance',
  Nuuron: 'decision intelligence',
} as const;
export type Product = keyof typeof PRODUCTS;

export interface CompetitorContract {
  id: string;
  competitor: Competitor;
  serviceLine: ServiceLine;
  scope: string;
  annualValue: number;
  /** ISO date */
  endDate: string;
  /** Client satisfaction with the competitor */
  satisfaction: Satisfaction;
}

/** A division or region of the client that we do not serve yet. */
export interface Division {
  name: string;
  /** Its annual IT services spend */
  spend: number;
  sponsorIdentified: boolean;
}

export interface Stakeholder {
  name: string;
  role: string;
  strength: Strength;
}

export interface ClientSignal {
  tone: 'positive' | 'watch' | 'risk';
  text: string;
}

export interface NextStep {
  step: string;
  owner: string;
  /** ISO date */
  due: string;
}

export interface OpportunityDetail {
  scope: string;
  /** Names from the account's stakeholders */
  decisionMakers: readonly string[];
  whyWeWin: string;
  risks: readonly string[];
  nextSteps: readonly [NextStep, NextStep, NextStep];
  /** Illustrative mapping to Coforge platforms */
  products: readonly {name: Product; why: string}[];
}

export interface Opportunity {
  id: string;
  name: string;
  type: OpportunityType;
  serviceLine: ServiceLine;
  status: OpportunityStatus;
  /** Active only */
  stage?: Stage;
  /** Annual contract value; for a renewal, the proposed new annual value */
  annualValue: number;
  /** Total contract value */
  tcv: number;
  /** Expected win %, Active only */
  winPct?: number;
  /** ISO date: expected close when open, the date it closed when won or lost */
  expectedClose: string;
  plannedMarginPct: number;
  /** Main competitor first; for a lost deal, the winner first */
  competitors: readonly Rival[];
  dealTeam: readonly string[];
  renewal?: {currentAnnualValue: number; contractEnd: string; status: string};
  expansion?: {project: string};
  newDivision?: {division: string};
  takeover?: {contractId: string};
  detail?: OpportunityDetail;
}

/** Quarter-end inputs for the six cards, kept for the two previous quarters. */
export interface GrowthSnapshot {
  /** Fiscal year-to-date revenue and the same period a year earlier */
  ytdRevenue: number;
  priorYtdRevenue: number;
  ttmRevenue: number;
  itSpend: number;
  securedFy27: number;
  /** Σ FY27 revenue if won, Active opportunities */
  pipelineIfWon: number;
  /** Σ expected FY27 revenue, Active opportunities */
  expectedFy27: number;
  largeDealCount: number;
  largeDealTcv: number;
  wonYtd: number;
  priorWonYtd: number;
  wonTtm: number;
  lostTtm: number;
  renewalsAtRisk: number;
}

export interface AccountGrowthData {
  id: string;
  fy26Revenue: number;
  /** Apr–Sep 2025 */
  fy26YtdRevenue: number;
  /** Apr–Sep 2026 */
  fy27YtdRevenue: number;
  /** FY27 revenue already under contract, including year-to-date actuals */
  securedFy27Revenue: number;
  /** Client's estimated annual IT services spend */
  itSpend: number;
  /** Value of deals won Apr–Sep 2025 */
  fy26YtdWonValue: number;
  /** Client spend by service line (adds up to itSpend) and whether we deliver it today */
  serviceLines: Readonly<Record<ServiceLine, {spend: number; coforge: boolean}>>;
  /** Annual spend with each competitor; In-house is the remainder of the wallet */
  competitorSpend: Readonly<Partial<Record<Competitor, number>>>;
  contracts: readonly CompetitorContract[];
  divisions: readonly Division[];
  stakeholders: readonly Stakeholder[];
  signals: readonly ClientSignal[];
  /** Why an opportunity type has no open opportunity */
  noOpportunity: Readonly<Partial<Record<OpportunityType, string>>>;
  opportunities: readonly Opportunity[];
}

/** Illustrative IT services market growth by vertical, % year on year, in QUARTERS order. */
export const MARKET_GROWTH: Readonly<Record<string, readonly [number, number, number]>> = {
  banking: [5.0, 4.6, 4.2],
  insurance: [6.0, 6.2, 6.5],
  travel: [8.5, 8.0, 7.6],
  healthcare: [9.0, 9.4, 9.8],
};

const SL = (eng: [number, boolean], data: [number, boolean], cloud: [number, boolean], apps: [number, boolean], qe: [number, boolean]) => ({
  'Digital Engineering': {spend: eng[0], coforge: eng[1]},
  'Data & AI': {spend: data[0], coforge: data[1]},
  'Cloud & Infra': {spend: cloud[0], coforge: cloud[1]},
  'Enterprise Apps': {spend: apps[0], coforge: apps[1]},
  'Quality Engineering': {spend: qe[0], coforge: qe[1]},
});

export const GROWTH_ACCOUNTS: readonly AccountGrowthData[] = [
  // ---------------------------------------------------------------- Banking · Retail Banking
  {
    id: 'northbridge-bank',
    fy26Revenue: 5000, fy26YtdRevenue: 2440, fy27YtdRevenue: 2560, securedFy27Revenue: 4650, itSpend: 12000, fy26YtdWonValue: 1300,
    serviceLines: SL([4000, true], [2500, true], [2800, true], [1700, false], [1000, true]),
    competitorSpend: {TCS: 2400, Infosys: 1500},
    contracts: [
      {id: 'nb-c1', competitor: 'Infosys', serviceLine: 'Enterprise Apps', scope: 'Core lending platform support', annualValue: 1500, endDate: '2028-09-30', satisfaction: 'Medium'},
      {id: 'nb-c2', competitor: 'TCS', serviceLine: 'Cloud & Infra', scope: 'Data centre and cloud operations', annualValue: 2400, endDate: '2029-03-31', satisfaction: 'High'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'Helen Price', role: 'CIO', strength: 'Strong'},
      {name: 'Omar Haddad', role: 'Head of Digital Channels', strength: 'Strong'},
      {name: 'Greg Lawson', role: 'Chief Procurement Officer', strength: 'Weak'},
    ],
    signals: [
      {tone: 'watch', text: 'Procurement is benchmarking all managed-services rates before renewals'},
      {tone: 'positive', text: 'CIO named Coforge "digital partner of the year" at the July vendor summit'},
    ],
    noOpportunity: {
      'New division/region': 'Already serves retail, cards and mortgages divisions',
      'Competitor takeover': 'No competitor contract expiring in 18 months',
    },
    opportunities: [
      {
        id: 'nb-renewal', name: 'Digital channels AMS renewal', type: 'Renewal', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 3600, tcv: 10800, winPct: 80, expectedClose: '2026-11-27', plannedMarginPct: 31, competitors: ['Infosys'], dealTeam: ['Aditi Sharma', 'Vivek Menon', 'Suresh Kumar'],
        renewal: {currentAnnualValue: 3500, contractEnd: '2026-12-31', status: 'Under negotiation'},
        detail: {
          scope: 'Three-year application support and enhancement for internet and mobile banking, with a 4% productivity commitment each year.',
          decisionMakers: ['Helen Price', 'Greg Lawson'],
          whyWeWin: 'Seven years of stable service and the knowledge of 40 integrations; Infosys is bidding low to get in but has no channel experience here.',
          risks: ['Procurement is pushing for a 6% rate cut', 'Infosys offering a free transition'],
          nextSteps: [
            {step: 'Submit the revised commercial offer with productivity credits', owner: 'Aditi Sharma', due: '2026-10-16'},
            {step: 'CIO steering meeting on AI-led support roadmap', owner: 'Vivek Menon', due: '2026-10-28'},
            {step: 'Agree final terms with procurement', owner: 'Aditi Sharma', due: '2026-11-20'},
          ],
          products: [
            {name: 'EvolveOps.AI', why: 'Agentic ticket triage funds the productivity commitment without cutting rates.'},
            {name: 'BlueSwan', why: 'Automated regression keeps release quality while support costs fall.'},
          ],
        },
      },
      {
        id: 'nb-onboarding', name: 'Digital onboarding phase 3', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Proposal',
        annualValue: 600, tcv: 1200, winPct: 30, expectedClose: '2026-12-11', plannedMarginPct: 33, competitors: ['In-house'], dealTeam: ['Aditi Sharma', 'Ravi Shankar'],
        expansion: {project: 'Digital Onboarding'},
        detail: {
          scope: 'Extend digital onboarding to small-business customers, including KYC and account opening in one journey.',
          decisionMakers: ['Omar Haddad'],
          whyWeWin: 'We built phases 1 and 2; drop-off fell 18% after go-live.',
          risks: ['Bank may build it in-house with its new engineering hub'],
          nextSteps: [
            {step: 'Share phase 2 conversion results with Head of Digital', owner: 'Ravi Shankar', due: '2026-10-21'},
            {step: 'Run a design sprint for the small-business journey', owner: 'Ravi Shankar', due: '2026-11-06'},
            {step: 'Submit fixed-price proposal', owner: 'Aditi Sharma', due: '2026-11-25'},
          ],
          products: [{name: 'Forge-X', why: 'AI-native engineering cuts the build time for the new journey.'}],
        },
      },
      {
        id: 'nb-openbanking', name: 'Open banking API layer', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Proposal',
        annualValue: 900, tcv: 1800, winPct: 35, expectedClose: '2026-11-20', plannedMarginPct: 30, competitors: ['TCS', 'In-house'], dealTeam: ['Aditi Sharma', 'Kelly Brown'],
        expansion: {project: 'Core Banking Upgrade'},
        detail: {
          scope: 'Expose core banking services as partner APIs to meet the 2027 open banking rules.',
          decisionMakers: ['Helen Price', 'Omar Haddad'],
          whyWeWin: 'We are already upgrading the core; the API layer sits on our design.',
          risks: ['TCS bundling APIs with its cloud operations contract'],
          nextSteps: [
            {step: 'Architecture review with the CIO office', owner: 'Kelly Brown', due: '2026-10-20'},
            {step: 'Price two delivery options', owner: 'Aditi Sharma', due: '2026-11-02'},
            {step: 'Submit proposal', owner: 'Aditi Sharma', due: '2026-11-13'},
          ],
          products: [{name: 'AIVA', why: 'Agentic development speeds up API build and documentation.'}],
        },
      },
      {
        id: 'nb-lending', name: 'Loan origination platform support', type: 'Cross-sell', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Qualified',
        annualValue: 500, tcv: 1500, winPct: 15, expectedClose: '2026-11-30', plannedMarginPct: 28, competitors: ['Infosys'], dealTeam: ['Aditi Sharma', 'Vivek Menon'],
        detail: {
          scope: 'Support for the new loan origination product, which sits outside the Infosys core lending contract.',
          decisionMakers: ['Helen Price'],
          whyWeWin: 'First Enterprise Apps work at the bank; we can show lending process knowledge from other banks.',
          risks: ['Infosys argues it should cover all lending systems'],
          nextSteps: [
            {step: 'Confirm scope boundary with the CIO', owner: 'Vivek Menon', due: '2026-10-23'},
            {step: 'Bring the Harbor Savings lending reference', owner: 'Aditi Sharma', due: '2026-11-04'},
            {step: 'Decide whether to bid', owner: 'Aditi Sharma', due: '2026-11-18'},
          ],
          products: [{name: 'CodeInsightAI', why: 'Maps the lending code quickly so we can take over support safely.'}],
        },
      },
      {
        id: 'nb-won-qe', name: 'Mobile app test automation', type: 'Expansion', serviceLine: 'Quality Engineering', status: 'Won',
        annualValue: 450, tcv: 900, expectedClose: '2026-07-15', plannedMarginPct: 34, competitors: ['Cognizant'], dealTeam: ['Aditi Sharma', 'Ravi Shankar'],
        expansion: {project: 'Digital Onboarding'},
      },
      {
        id: 'nb-lost-cards', name: 'Cards analytics refresh', type: 'Expansion', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 700, tcv: 1400, expectedClose: '2026-03-20', plannedMarginPct: 30, competitors: ['TCS'], dealTeam: ['Aditi Sharma'],
        expansion: {project: 'Cards data mart'},
      },
    ],
  },
  {
    id: 'harbor-savings',
    fy26Revenue: 3000, fy26YtdRevenue: 1460, fy27YtdRevenue: 1540, securedFy27Revenue: 2900, itSpend: 7500, fy26YtdWonValue: 700,
    serviceLines: SL([2600, true], [1500, false], [1600, true], [1000, true], [800, true]),
    competitorSpend: {Accenture: 1400, Cognizant: 900},
    contracts: [
      {id: 'hs-c1', competitor: 'Accenture', serviceLine: 'Data & AI', scope: 'Data warehouse and reporting', annualValue: 1400, endDate: '2027-06-30', satisfaction: 'Low'},
      {id: 'hs-c2', competitor: 'Cognizant', serviceLine: 'Cloud & Infra', scope: 'Network and end-user services', annualValue: 900, endDate: '2029-01-31', satisfaction: 'Medium'},
    ],
    divisions: [{name: 'Wealth Management', spend: 1200, sponsorIdentified: true}],
    stakeholders: [
      {name: 'Paula Nguyen', role: 'COO', strength: 'Strong'},
      {name: 'Ben Archer', role: 'Chief Data Officer', strength: 'Medium'},
      {name: 'Irene Walsh', role: 'Head of Wealth Digital', strength: 'Weak'},
    ],
    signals: [
      {tone: 'positive', text: 'New CDO unhappy with Accenture data latency; asked us for a view'},
      {tone: 'watch', text: 'Wealth unit has its own budget from FY28'},
    ],
    noOpportunity: {'Cross-sell': 'Only gap is Data & AI, pursued as the Accenture takeover'},
    opportunities: [
      {
        id: 'hs-takeover', name: 'Data platform takeover from Accenture', type: 'Competitor takeover', serviceLine: 'Data & AI', status: 'Active', stage: 'Proposal',
        annualValue: 1200, tcv: 3600, winPct: 30, expectedClose: '2026-11-27', plannedMarginPct: 30, competitors: ['Accenture', 'Infosys'], dealTeam: ['Mark Thompson', 'Vivek Menon'],
        takeover: {contractId: 'hs-c1'},
        detail: {
          scope: 'Take over and modernise the data warehouse and regulatory reporting, moving to a cloud lakehouse.',
          decisionMakers: ['Ben Archer', 'Paula Nguyen'],
          whyWeWin: 'Client is unhappy with Accenture data latency; we offer a fixed-price transition and a 30-day proof.',
          risks: ['Accenture may cut price to keep it', 'New CDO still forming views'],
          nextSteps: [
            {step: 'Run a 30-day data latency proof', owner: 'Vivek Menon', due: '2026-10-30'},
            {step: 'Present transition plan to the COO', owner: 'Mark Thompson', due: '2026-11-10'},
            {step: 'Submit best and final offer', owner: 'Mark Thompson', due: '2026-11-20'},
          ],
          products: [
            {name: 'Data Cosmos', why: 'Ready-made lakehouse accelerators shorten the move off the old warehouse.'},
            {name: 'Nuuron', why: 'Gives the COO decision dashboards on day one.'},
          ],
        },
      },
      {
        id: 'hs-mobile', name: 'Mobile app rebuild – wave 2', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Proposal',
        annualValue: 700, tcv: 1400, winPct: 35, expectedClose: '2026-10-30', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Mark Thompson', 'Siddharth Rao'],
        expansion: {project: 'Mobile App Rebuild'},
        detail: {
          scope: 'Add savings goals, card controls and in-app support to the rebuilt mobile app.',
          decisionMakers: ['Paula Nguyen'],
          whyWeWin: 'Wave 1 shipped on time and app rating rose from 3.6 to 4.5.',
          risks: ['Budget may move to the in-house team in FY28'],
          nextSteps: [
            {step: 'Demo wave 1 adoption numbers', owner: 'Siddharth Rao', due: '2026-10-14'},
            {step: 'Agree wave 2 backlog', owner: 'Siddharth Rao', due: '2026-10-21'},
            {step: 'Sign change order', owner: 'Mark Thompson', due: '2026-10-28'},
          ],
          products: [{name: 'Forge-X', why: 'Reuses wave 1 components to keep cost flat.'}],
        },
      },
      {
        id: 'hs-cloud-renewal', name: 'Cloud hosting renewal', type: 'Renewal', serviceLine: 'Cloud & Infra', status: 'Active', stage: 'Proposal',
        annualValue: 950, tcv: 1900, winPct: 80, expectedClose: '2027-02-12', plannedMarginPct: 27, competitors: ['Cognizant'], dealTeam: ['Mark Thompson', 'Suresh Kumar'],
        renewal: {currentAnnualValue: 900, contractEnd: '2027-03-31', status: 'Proposal submitted'},
        detail: {
          scope: 'Two-year renewal of cloud hosting and operations with added FinOps reporting.',
          decisionMakers: ['Paula Nguyen'],
          whyWeWin: 'Zero major incidents in 24 months; FinOps saved 12% of cloud cost.',
          risks: ['Cognizant offering to bundle with network services'],
          nextSteps: [
            {step: 'Share FinOps savings report', owner: 'Suresh Kumar', due: '2026-11-05'},
            {step: 'Quarterly service review', owner: 'Mark Thompson', due: '2026-12-03'},
            {step: 'Commercial negotiation', owner: 'Mark Thompson', due: '2027-01-20'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Self-healing operations justify the 5% uplift.'}],
        },
      },
      {
        id: 'hs-wealth', name: 'Wealth management digital platform', type: 'New division/region', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Qualified',
        annualValue: 600, tcv: 1800, winPct: 25, expectedClose: '2026-11-30', plannedMarginPct: 31, competitors: ['Accenture'], dealTeam: ['Mark Thompson', 'Vivek Menon'],
        newDivision: {division: 'Wealth Management'},
        detail: {
          scope: 'Adviser and client portal for the Wealth Management unit, our first work outside retail banking.',
          decisionMakers: ['Irene Walsh'],
          whyWeWin: 'COO is willing to introduce us; we bring wealth platform references from other banks.',
          risks: ['Sponsor relationship is new', 'Accenture already advises the wealth unit'],
          nextSteps: [
            {step: 'COO introduction to Head of Wealth Digital', owner: 'Mark Thompson', due: '2026-10-19'},
            {step: 'Discovery workshop', owner: 'Vivek Menon', due: '2026-11-03'},
            {step: 'Qualify budget and timing', owner: 'Mark Thompson', due: '2026-11-17'},
          ],
          products: [{name: 'Forge-X', why: 'Reusable portal components lower the entry price.'}],
        },
      },
      {
        id: 'hs-won-branch', name: 'Branch servicing app', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Won',
        annualValue: 400, tcv: 800, expectedClose: '2026-05-20', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Mark Thompson'],
        expansion: {project: 'Mobile App Rebuild'},
      },
      {
        id: 'hs-lost-fraud', name: 'Fraud analytics', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 500, tcv: 1000, expectedClose: '2025-12-10', plannedMarginPct: 29, competitors: ['Accenture'], dealTeam: ['Mark Thompson'],
      },
    ],
  },
  {
    id: 'crestline-credit-union',
    fy26Revenue: 2000, fy26YtdRevenue: 980, fy27YtdRevenue: 1050, securedFy27Revenue: 1930, itSpend: 4600, fy26YtdWonValue: 500,
    serviceLines: SL([1800, true], [700, true], [1000, true], [600, true], [500, true]),
    competitorSpend: {Cognizant: 900},
    contracts: [
      {id: 'cc-c1', competitor: 'Cognizant', serviceLine: 'Cloud & Infra', scope: 'Infrastructure managed services', annualValue: 900, endDate: '2027-12-31', satisfaction: 'Medium'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'Dana Morales', role: 'CEO', strength: 'Medium'},
      {name: 'Kevin Brooks', role: 'CIO', strength: 'Strong'},
    ],
    signals: [
      {tone: 'positive', text: 'Board approved a 3-year digital member experience plan'},
      {tone: 'watch', text: 'Cognizant infra contract up for review at end of 2027'},
    ],
    noOpportunity: {
      'Cross-sell': 'Buys all 5 service lines',
      'New division/region': 'Single-division credit union',
    },
    opportunities: [
      {
        id: 'cc-takeover', name: 'Infrastructure services takeover from Cognizant', type: 'Competitor takeover', serviceLine: 'Cloud & Infra', status: 'Active', stage: 'Qualified',
        annualValue: 800, tcv: 2400, winPct: 25, expectedClose: '2026-12-18', plannedMarginPct: 26, competitors: ['Cognizant'], dealTeam: ['Kavya Reddy', 'Vivek Menon'],
        takeover: {contractId: 'cc-c1'},
        detail: {
          scope: 'Take over infrastructure managed services early and consolidate with our cloud work.',
          decisionMakers: ['Kevin Brooks'],
          whyWeWin: 'One partner for cloud and infrastructure lowers cost by about 10%.',
          risks: ['Early exit fee on the Cognizant contract'],
          nextSteps: [
            {step: 'Model the exit fee against savings', owner: 'Vivek Menon', due: '2026-10-27'},
            {step: 'CIO workshop on consolidated operations', owner: 'Kavya Reddy', due: '2026-11-12'},
            {step: 'Decide on early or 2027 transition', owner: 'Kavya Reddy', due: '2026-12-04'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Agentic operations make the consolidated service cheaper to run.'}],
        },
      },
      {
        id: 'cc-cards', name: 'Member app – card controls', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Proposal',
        annualValue: 400, tcv: 800, winPct: 30, expectedClose: '2026-11-20', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Kavya Reddy', 'Suresh Kumar'],
        expansion: {project: 'Member App'},
        detail: {
          scope: 'Card freeze, travel notices and spend limits in the member app.',
          decisionMakers: ['Kevin Brooks'],
          whyWeWin: 'Part of the board-approved digital plan; we own the app codebase.',
          risks: ['Could slip to FY28 budget'],
          nextSteps: [
            {step: 'Size the feature set', owner: 'Suresh Kumar', due: '2026-10-22'},
            {step: 'Submit proposal', owner: 'Kavya Reddy', due: '2026-11-05'},
            {step: 'CIO approval', owner: 'Kavya Reddy', due: '2026-11-19'},
          ],
          products: [{name: 'AIVA', why: 'Agentic development keeps the small team productive.'}],
        },
      },
      {
        id: 'cc-renewal', name: 'Core integration support renewal', type: 'Renewal', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Negotiation',
        annualValue: 520, tcv: 1040, winPct: 75, expectedClose: '2026-10-30', plannedMarginPct: 30, competitors: ['In-house'], dealTeam: ['Kavya Reddy', 'Suresh Kumar'],
        renewal: {currentAnnualValue: 500, contractEnd: '2026-11-30', status: 'Under negotiation'},
        detail: {
          scope: 'Two-year renewal of core banking integration support.',
          decisionMakers: ['Kevin Brooks', 'Dana Morales'],
          whyWeWin: 'Stable service; switching cost is high for a small IT team.',
          risks: ['CEO asking whether some work can move in-house'],
          nextSteps: [
            {step: 'Agree service levels', owner: 'Suresh Kumar', due: '2026-10-15'},
            {step: 'Final price with the CIO', owner: 'Kavya Reddy', due: '2026-10-22'},
            {step: 'Contract signature', owner: 'Kavya Reddy', due: '2026-10-30'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Automates routine integration fixes, absorbing the 4% uplift.'}],
        },
      },
      {
        id: 'cc-won-dwh', name: 'Data warehouse modernisation', type: 'Expansion', serviceLine: 'Data & AI', status: 'Won',
        annualValue: 300, tcv: 600, expectedClose: '2026-04-22', plannedMarginPct: 31, competitors: ['Infosys'], dealTeam: ['Kavya Reddy'],
        expansion: {project: 'Member data hub'},
      },
      {
        id: 'cc-lost-lending', name: 'Digital lending portal', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Lost',
        annualValue: 350, tcv: 700, expectedClose: '2026-02-12', plannedMarginPct: 30, competitors: ['Infosys'], dealTeam: ['Kavya Reddy'],
        expansion: {project: 'Member App'},
      },
    ],
  },
  // ---------------------------------------------------------------- Banking · Corporate Banking
  {
    id: 'sterling-commercial-bank',
    fy26Revenue: 7000, fy26YtdRevenue: 3440, fy27YtdRevenue: 3560, securedFy27Revenue: 6650, itSpend: 18000, fy26YtdWonValue: 1500,
    serviceLines: SL([5500, true], [3500, true], [4000, false], [3000, true], [2000, true]),
    competitorSpend: {TCS: 4000, Accenture: 1800},
    contracts: [
      {id: 'st-c1', competitor: 'TCS', serviceLine: 'Cloud & Infra', scope: 'Cloud and infrastructure managed services', annualValue: 4000, endDate: '2027-03-31', satisfaction: 'Low'},
      {id: 'st-c2', competitor: 'Accenture', serviceLine: 'Enterprise Apps', scope: 'Trade finance package support', annualValue: 1800, endDate: '2028-12-31', satisfaction: 'Medium'},
    ],
    divisions: [{name: 'Commercial Cards', spend: 2000, sponsorIdentified: false}],
    stakeholders: [
      {name: 'Richard Hale', role: 'Group CIO', strength: 'Strong'},
      {name: 'Monica Reyes', role: 'Head of Infrastructure', strength: 'Medium'},
      {name: 'Stuart Bell', role: 'CFO', strength: 'Weak'},
    ],
    signals: [
      {tone: 'risk', text: 'Two severity-1 outages on TCS-run infrastructure this year; regulator asked questions'},
      {tone: 'positive', text: 'Group CIO wants one partner for applications and infrastructure'},
      {tone: 'watch', text: 'CFO cutting discretionary change budget 5% in FY28'},
    ],
    noOpportunity: {'Cross-sell': 'Only gap is Cloud & Infra, pursued as the TCS takeover'},
    opportunities: [
      {
        id: 'st-tcs', name: 'Cloud & infrastructure takeover from TCS', type: 'Competitor takeover', serviceLine: 'Cloud & Infra', status: 'Active', stage: 'Proposal',
        annualValue: 3500, tcv: 14000, winPct: 35, expectedClose: '2026-10-30', plannedMarginPct: 27, competitors: ['TCS', 'Infosys'], dealTeam: ['Nikhil Bansal', 'Vivek Menon', 'Emily Watson'],
        takeover: {contractId: 'st-c1'},
        detail: {
          scope: 'Four-year cloud and infrastructure managed services, with a phased takeover from TCS starting in November and full exit by March 2027.',
          decisionMakers: ['Richard Hale', 'Monica Reyes', 'Stuart Bell'],
          whyWeWin: 'Client lost confidence in TCS after two outages; we already run the applications, so one partner removes hand-offs.',
          risks: ['TCS may offer a steep discount to stay', 'CFO not yet engaged on the business case', 'Transition risk during year-end freeze'],
          nextSteps: [
            {step: 'CFO business case session on outage cost and savings', owner: 'Nikhil Bansal', due: '2026-10-14'},
            {step: 'Transition risk review with Head of Infrastructure', owner: 'Emily Watson', due: '2026-10-20'},
            {step: 'Best and final offer', owner: 'Nikhil Bansal', due: '2026-10-27'},
          ],
          products: [
            {name: 'EvolveOps.AI', why: 'Agentic operations target the incident types behind the two outages.'},
            {name: 'AgentSphere', why: 'Governance of AI agents in operations reassures the regulator.'},
          ],
        },
      },
      {
        id: 'st-tradefin', name: 'Trade finance platform – phase 2', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Proposal',
        annualValue: 900, tcv: 1800, winPct: 45, expectedClose: '2026-11-13', plannedMarginPct: 32, competitors: ['Accenture'], dealTeam: ['Nikhil Bansal', 'Ajay Nambiar'],
        expansion: {project: 'Trade Finance Platform'},
        detail: {
          scope: 'Digital letters of credit and guarantees for corporate clients.',
          decisionMakers: ['Richard Hale'],
          whyWeWin: 'Phase 1 is live; Accenture supports the package but not the digital layer.',
          risks: ['Delivery status on phase 1 is amber (on-time 85.7%)'],
          nextSteps: [
            {step: 'Fix phase 1 on-time delivery', owner: 'Ajay Nambiar', due: '2026-10-23'},
            {step: 'Submit phase 2 proposal', owner: 'Nikhil Bansal', due: '2026-10-30'},
            {step: 'Steering approval', owner: 'Nikhil Bansal', due: '2026-11-10'},
          ],
          products: [{name: 'Forge-X', why: 'AI-native engineering recovers schedule on the shared platform.'}],
        },
      },
      {
        id: 'st-regdata', name: 'Regulatory reporting on the treasury data hub', type: 'Expansion', serviceLine: 'Data & AI', status: 'Active', stage: 'Proposal',
        annualValue: 1500, tcv: 3000, winPct: 30, expectedClose: '2026-10-30', plannedMarginPct: 30, competitors: ['Accenture'], dealTeam: ['Nikhil Bansal', 'Rachel Green'],
        expansion: {project: 'Treasury Data Hub'},
        detail: {
          scope: 'Move liquidity and capital reporting onto the treasury data hub.',
          decisionMakers: ['Richard Hale', 'Stuart Bell'],
          whyWeWin: 'We built the data hub; reporting on it avoids a second platform.',
          risks: ['Lost the liquidity analytics deal to Accenture in August'],
          nextSteps: [
            {step: 'Show reconciliation results to finance', owner: 'Rachel Green', due: '2026-10-16'},
            {step: 'Joint workshop with CFO team', owner: 'Nikhil Bansal', due: '2026-10-22'},
            {step: 'Submit proposal', owner: 'Nikhil Bansal', due: '2026-10-28'},
          ],
          products: [
            {name: 'Data Cosmos', why: 'Regulatory data models are ready to deploy on the hub.'},
            {name: 'Nuuron', why: 'Decision views for the CFO on capital and liquidity.'},
          ],
        },
      },
      {
        id: 'st-renewal', name: 'Treasury data hub support renewal', type: 'Renewal', serviceLine: 'Data & AI', status: 'Active', stage: 'Proposal',
        annualValue: 1260, tcv: 2520, winPct: 75, expectedClose: '2026-12-11', plannedMarginPct: 31, competitors: ['Accenture'], dealTeam: ['Nikhil Bansal', 'Rachel Green'],
        renewal: {currentAnnualValue: 1200, contractEnd: '2027-01-31', status: 'Proposal submitted'},
        detail: {
          scope: 'Two-year renewal of treasury data hub support with a 5% uplift for new data feeds.',
          decisionMakers: ['Richard Hale'],
          whyWeWin: 'We built and run the hub; client satisfaction 4.4.',
          risks: ['Utilisation on the team is 77%, client has noticed slow responses'],
          nextSteps: [
            {step: 'Restore team utilisation and response times', owner: 'Rachel Green', due: '2026-10-30'},
            {step: 'Service review with Group CIO', owner: 'Nikhil Bansal', due: '2026-11-12'},
            {step: 'Commercial close', owner: 'Nikhil Bansal', due: '2026-12-08'},
          ],
          products: [{name: 'Data Cosmos', why: 'Automated data quality checks support the uplift.'}],
        },
      },
      {
        id: 'st-cards', name: 'Commercial cards digital servicing', type: 'New division/region', serviceLine: 'Digital Engineering', status: 'Potential',
        annualValue: 800, tcv: 2400, expectedClose: '2027-04-30', plannedMarginPct: 31, competitors: ['Accenture'], dealTeam: ['Nikhil Bansal'],
        newDivision: {division: 'Commercial Cards'},
        detail: {
          scope: 'Online servicing for corporate card programmes.',
          decisionMakers: ['Richard Hale'],
          whyWeWin: 'Group CIO can introduce us; we built the corporate portal.',
          risks: ['No sponsor in the cards division yet'],
          nextSteps: [
            {step: 'Ask Group CIO for an introduction', owner: 'Nikhil Bansal', due: '2026-10-29'},
            {step: 'Meet Head of Commercial Cards', owner: 'Nikhil Bansal', due: '2026-11-24'},
            {step: 'Qualify budget for FY28', owner: 'Nikhil Bansal', due: '2026-12-15'},
          ],
          products: [{name: 'Forge-X', why: 'Reuses the corporate portal design.'}],
        },
      },
      {
        id: 'st-won-payments', name: 'Payments hub enhancements', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Won',
        annualValue: 600, tcv: 1200, expectedClose: '2026-06-12', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Nikhil Bansal'],
        expansion: {project: 'Payments Hub'},
      },
      {
        id: 'st-lost-liquidity', name: 'Liquidity analytics', type: 'Expansion', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 750, tcv: 1500, expectedClose: '2026-08-28', plannedMarginPct: 30, competitors: ['Accenture'], dealTeam: ['Nikhil Bansal'],
        expansion: {project: 'Treasury Data Hub'},
      },
    ],
  },
  {
    id: 'atlas-trade-finance',
    fy26Revenue: 2000, fy26YtdRevenue: 980, fy27YtdRevenue: 1040, securedFy27Revenue: 1870, itSpend: 5000, fy26YtdWonValue: 400,
    serviceLines: SL([1800, true], [900, false], [1100, true], [700, true], [500, true]),
    competitorSpend: {Infosys: 600},
    contracts: [
      {id: 'at-c1', competitor: 'Infosys', serviceLine: 'Data & AI', scope: 'Reporting data mart', annualValue: 600, endDate: '2029-06-30', satisfaction: 'Medium'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'Lena Fischer', role: 'CTO', strength: 'Strong'},
      {name: 'Mark Osei', role: 'Head of Operations', strength: 'Medium'},
    ],
    signals: [
      {tone: 'positive', text: 'Operations wants AI to read trade documents; 60% of effort is manual today'},
      {tone: 'watch', text: 'Parent group reviewing vendor list in Q4'},
    ],
    noOpportunity: {
      'New division/region': 'No other division with its own IT budget',
      'Competitor takeover': 'No competitor contract expiring in 18 months',
    },
    opportunities: [
      {
        id: 'at-docai', name: 'Trade document AI extraction', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Active', stage: 'Proposal',
        annualValue: 500, tcv: 1000, winPct: 30, expectedClose: '2026-11-27', plannedMarginPct: 33, competitors: ['Infosys'], dealTeam: ['Jessica Moore', 'Vivek Menon'],
        detail: {
          scope: 'AI extraction and checking of bills of lading and invoices for trade operations.',
          decisionMakers: ['Mark Osei', 'Lena Fischer'],
          whyWeWin: 'Operations sponsor; our proof read 92% of fields correctly.',
          risks: ['Infosys pitching it as an add-on to the data mart'],
          nextSteps: [
            {step: 'Extend the proof to letters of credit', owner: 'Vivek Menon', due: '2026-10-26'},
            {step: 'Business case with Head of Operations', owner: 'Jessica Moore', due: '2026-11-09'},
            {step: 'Submit proposal', owner: 'Jessica Moore', due: '2026-11-20'},
          ],
          products: [
            {name: 'Coforge Quasar', why: 'Document AI models run on the enterprise AI platform.'},
            {name: 'AgentSphere', why: 'Audit trail for AI decisions in a regulated process.'},
          ],
        },
      },
      {
        id: 'at-scf', name: 'Supply-chain finance portal', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 600, tcv: 1200, winPct: 60, expectedClose: '2026-10-23', plannedMarginPct: 32, competitors: ['LTIMindtree'], dealTeam: ['Jessica Moore', 'Emily Watson'],
        expansion: {project: 'Trade Portal'},
        detail: {
          scope: 'Supplier onboarding and early-payment portal on the existing trade platform.',
          decisionMakers: ['Lena Fischer'],
          whyWeWin: 'Extends our platform; LTIMindtree would need a new integration.',
          risks: ['Price gap of about 8% to LTIMindtree'],
          nextSteps: [
            {step: 'Revised price with phased scope', owner: 'Jessica Moore', due: '2026-10-13'},
            {step: 'CTO sign-off', owner: 'Jessica Moore', due: '2026-10-19'},
            {step: 'Contract signature', owner: 'Jessica Moore', due: '2026-10-23'},
          ],
          products: [{name: 'Forge-X', why: 'Faster build closes the price gap.'}],
        },
      },
      {
        id: 'at-renewal', name: 'Cloud operations renewal', type: 'Renewal', serviceLine: 'Cloud & Infra', status: 'Active', stage: 'Negotiation',
        annualValue: 700, tcv: 1400, winPct: 75, expectedClose: '2026-11-30', plannedMarginPct: 27, competitors: ['Infosys'], dealTeam: ['Jessica Moore', 'Emily Watson'],
        renewal: {currentAnnualValue: 700, contractEnd: '2026-12-31', status: 'Under negotiation'},
        detail: {
          scope: 'Two-year cloud operations renewal at flat price.',
          decisionMakers: ['Lena Fischer'],
          whyWeWin: 'Service levels met every month; flat price offered.',
          risks: ['Parent group vendor review may consolidate cloud with Infosys'],
          nextSteps: [
            {step: 'Brief parent group IT on service record', owner: 'Jessica Moore', due: '2026-10-20'},
            {step: 'Agree terms', owner: 'Jessica Moore', due: '2026-11-10'},
            {step: 'Signature', owner: 'Jessica Moore', due: '2026-11-27'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Keeps price flat by automating routine operations.'}],
        },
      },
      {
        id: 'at-won-qe', name: 'Trade portal test automation', type: 'Expansion', serviceLine: 'Quality Engineering', status: 'Won',
        annualValue: 250, tcv: 500, expectedClose: '2025-11-18', plannedMarginPct: 34, competitors: ['In-house'], dealTeam: ['Jessica Moore'],
        expansion: {project: 'Trade Portal'},
      },
      {
        id: 'at-lost-sanctions', name: 'Sanctions screening analytics', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 200, tcv: 400, expectedClose: '2026-05-14', plannedMarginPct: 30, competitors: ['Infosys'], dealTeam: ['Jessica Moore'],
      },
    ],
  },
  // ---------------------------------------------------------------- Insurance · Life & Annuities
  {
    id: 'evergreen-life',
    fy26Revenue: 5000, fy26YtdRevenue: 2420, fy27YtdRevenue: 2700, securedFy27Revenue: 4660, itSpend: 16000, fy26YtdWonValue: 1100,
    serviceLines: SL([4500, true], [4000, false], [3000, true], [3500, true], [1000, true]),
    competitorSpend: {Accenture: 1500, Cognizant: 2000},
    contracts: [
      {id: 'ev-c1', competitor: 'Cognizant', serviceLine: 'Enterprise Apps', scope: 'Claims system support', annualValue: 2000, endDate: '2028-06-30', satisfaction: 'Medium'},
      {id: 'ev-c2', competitor: 'Accenture', serviceLine: 'Data & AI', scope: 'Actuarial data platform', annualValue: 1500, endDate: '2029-03-31', satisfaction: 'High'},
    ],
    divisions: [{name: 'Group Benefits', spend: 2500, sponsorIdentified: true}],
    stakeholders: [
      {name: 'Catherine Moss', role: 'CIO', strength: 'Medium'},
      {name: 'Daniel Okafor', role: 'Chief Data Officer', strength: 'Weak'},
      {name: 'Fiona Grant', role: 'Head of Procurement', strength: 'Medium'},
    ],
    signals: [
      {tone: 'risk', text: 'TCS presented a policy admin replacement to the CIO in September'},
      {tone: 'positive', text: 'New CDO has a $4M Data & AI budget for FY28 and no preferred partner'},
      {tone: 'watch', text: 'Procurement asked for a 4% price cut on the renewal'},
    ],
    noOpportunity: {'Competitor takeover': 'No competitor contract expiring in 18 months'},
    opportunities: [
      {
        id: 'ev-renewal', name: 'Policy admin platform renewal', type: 'Renewal', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Proposal',
        annualValue: 3600, tcv: 10800, winPct: 70, expectedClose: '2026-12-18', plannedMarginPct: 34, competitors: ['TCS', 'Infosys'], dealTeam: ['Sophie Turner', 'Laura Bennett', 'Rohan Joshi'],
        renewal: {currentAnnualValue: 3750, contractEnd: '2027-01-31', status: 'Proposal submitted'},
        detail: {
          scope: 'Three-year renewal of policy administration support and upgrades, ending 31 Jan 2027; proposal at a 4% lower annual value.',
          decisionMakers: ['Catherine Moss', 'Fiona Grant'],
          whyWeWin: 'Ten years on the platform and 4.6 client satisfaction; replacing us mid-upgrade is risky for the client.',
          risks: ['TCS proposing a full platform replacement', 'Procurement may run a formal tender', 'Price cut lowers margin'],
          nextSteps: [
            {step: 'CEO-to-CEO meeting on the 3-year roadmap', owner: 'Sophie Turner', due: '2026-10-21'},
            {step: 'Present AI-led modernisation option to the CIO', owner: 'Laura Bennett', due: '2026-11-04'},
            {step: 'Close commercials with procurement', owner: 'Sophie Turner', due: '2026-12-11'},
          ],
          products: [
            {name: 'CodeInsightAI', why: 'Modernises the policy admin code in place, answering the TCS replacement pitch.'},
            {name: 'EvolveOps.AI', why: 'Lowers run cost to fund the 4% price cut without losing margin.'},
          ],
        },
      },
      {
        id: 'ev-dataai', name: 'Enterprise data & AI platform', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Active', stage: 'Proposal',
        annualValue: 1800, tcv: 5400, winPct: 40, expectedClose: '2026-11-30', plannedMarginPct: 31, competitors: ['Accenture', 'In-house'], dealTeam: ['Sophie Turner', 'Laura Bennett'],
        detail: {
          scope: 'Customer and policy data platform with underwriting and retention AI models.',
          decisionMakers: ['Daniel Okafor', 'Catherine Moss'],
          whyWeWin: 'We hold the policy data domain knowledge; CDO has no preferred partner.',
          risks: ['Accenture runs the actuarial platform', 'Weak relationship with the new CDO'],
          nextSteps: [
            {step: 'Introduce our Data & AI head to the CDO', owner: 'Laura Bennett', due: '2026-10-15'},
            {step: 'Two-week retention model proof', owner: 'Laura Bennett', due: '2026-11-06'},
            {step: 'Submit proposal', owner: 'Sophie Turner', due: '2026-11-20'},
          ],
          products: [
            {name: 'Data Cosmos', why: 'Insurance data models shorten the platform build.'},
            {name: 'Coforge Quasar', why: 'Runs the underwriting and retention models.'},
          ],
        },
      },
      {
        id: 'ev-portal', name: 'Agent portal – phase 2', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 900, tcv: 1800, winPct: 65, expectedClose: '2026-10-30', plannedMarginPct: 33, competitors: ['In-house'], dealTeam: ['Sophie Turner', 'Rohan Joshi'],
        expansion: {project: 'Agent Portal'},
        detail: {
          scope: 'Quote-and-bind and commission views for independent agents.',
          decisionMakers: ['Catherine Moss'],
          whyWeWin: 'Phase 1 cut quote time by half.',
          risks: ['Budget could be held back if renewal talks stall'],
          nextSteps: [
            {step: 'Confirm phase 2 backlog', owner: 'Rohan Joshi', due: '2026-10-14'},
            {step: 'Final price', owner: 'Sophie Turner', due: '2026-10-21'},
            {step: 'Sign change order', owner: 'Sophie Turner', due: '2026-10-28'},
          ],
          products: [{name: 'Forge-X', why: 'AI-native engineering keeps phase 2 on budget.'}],
        },
      },
      {
        id: 'ev-benefits', name: 'Group benefits digital enrolment', type: 'New division/region', serviceLine: 'Digital Engineering', status: 'Potential',
        annualValue: 1000, tcv: 3000, expectedClose: '2027-05-31', plannedMarginPct: 31, competitors: ['Accenture'], dealTeam: ['Sophie Turner'],
        newDivision: {division: 'Group Benefits'},
        detail: {
          scope: 'Employer and member enrolment portal for the Group Benefits division.',
          decisionMakers: ['Catherine Moss'],
          whyWeWin: 'Sponsor identified; reuses agent portal components.',
          risks: ['Division budget not approved until FY28'],
          nextSteps: [
            {step: 'Meet Group Benefits sponsor', owner: 'Sophie Turner', due: '2026-11-03'},
            {step: 'Discovery workshop', owner: 'Sophie Turner', due: '2026-11-24'},
            {step: 'Qualify FY28 budget', owner: 'Sophie Turner', due: '2026-12-15'},
          ],
          products: [{name: 'Forge-X', why: 'Reuse of portal components lowers cost.'}],
        },
      },
      {
        id: 'ev-won-qe', name: 'Claims test automation', type: 'Expansion', serviceLine: 'Quality Engineering', status: 'Won',
        annualValue: 500, tcv: 1000, expectedClose: '2026-08-05', plannedMarginPct: 34, competitors: ['Cognizant'], dealTeam: ['Sophie Turner'],
        expansion: {project: 'Policy Admin Modernisation'},
      },
      {
        id: 'ev-lost-uw', name: 'Underwriting AI pilot', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 400, tcv: 800, expectedClose: '2026-04-30', plannedMarginPct: 30, competitors: ['Accenture'], dealTeam: ['Sophie Turner'],
      },
    ],
  },
  {
    id: 'summit-annuity',
    fy26Revenue: 2500, fy26YtdRevenue: 1200, fy27YtdRevenue: 1330, securedFy27Revenue: 2450, itSpend: 9000, fy26YtdWonValue: 500,
    serviceLines: SL([2800, true], [2000, false], [1800, true], [1600, false], [800, true]),
    competitorSpend: {Infosys: 1500, TCS: 800},
    contracts: [
      {id: 'sa-c1', competitor: 'Infosys', serviceLine: 'Enterprise Apps', scope: 'Annuity administration support', annualValue: 1500, endDate: '2027-09-30', satisfaction: 'Low'},
      {id: 'sa-c2', competitor: 'TCS', serviceLine: 'Data & AI', scope: 'Finance data warehouse', annualValue: 800, endDate: '2029-02-28', satisfaction: 'Medium'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'Robert Klein', role: 'CIO', strength: 'Strong'},
      {name: 'Anita Shah', role: 'Head of Annuity Operations', strength: 'Medium'},
    ],
    signals: [
      {tone: 'positive', text: 'Annuity operations unhappy with Infosys backlog; open to a switch'},
      {tone: 'watch', text: 'CIO consolidating vendors from 7 to 4 by 2028'},
    ],
    noOpportunity: {'New division/region': 'Single annuity business with one IT budget'},
    opportunities: [
      {
        id: 'sa-takeover', name: 'Annuity admin support takeover from Infosys', type: 'Competitor takeover', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Proposal',
        annualValue: 1400, tcv: 5600, winPct: 40, expectedClose: '2027-02-26', plannedMarginPct: 30, competitors: ['Infosys'], dealTeam: ['Varun Khanna', 'Laura Bennett'],
        takeover: {contractId: 'sa-c1'},
        detail: {
          scope: 'Four-year support of the annuity administration system from March 2027.',
          decisionMakers: ['Robert Klein', 'Anita Shah'],
          whyWeWin: 'Operations unhappy with Infosys backlog; vendor consolidation favours an existing partner.',
          risks: ['Infosys may offer extra capacity at no cost'],
          nextSteps: [
            {step: 'Backlog assessment with annuity operations', owner: 'Laura Bennett', due: '2026-11-05'},
            {step: 'Transition plan to the CIO', owner: 'Varun Khanna', due: '2026-12-03'},
            {step: 'Submit proposal', owner: 'Varun Khanna', due: '2027-01-15'},
          ],
          products: [{name: 'CodeInsightAI', why: 'Maps the legacy annuity code for a safe takeover.'}],
        },
      },
      {
        id: 'sa-analytics', name: 'Annuity analytics', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Active', stage: 'Qualified',
        annualValue: 700, tcv: 2100, winPct: 25, expectedClose: '2026-12-18', plannedMarginPct: 31, competitors: ['TCS'], dealTeam: ['Varun Khanna', 'Laura Bennett'],
        detail: {
          scope: 'Lapse and surrender prediction for the annuity book.',
          decisionMakers: ['Anita Shah'],
          whyWeWin: 'Operations sponsor; we can use data from our own systems.',
          risks: ['TCS runs the finance data warehouse'],
          nextSteps: [
            {step: 'Data discovery', owner: 'Laura Bennett', due: '2026-10-28'},
            {step: 'Use-case workshop', owner: 'Varun Khanna', due: '2026-11-18'},
            {step: 'Qualify budget', owner: 'Varun Khanna', due: '2026-12-02'},
          ],
          products: [{name: 'Data Cosmos', why: 'Insurance analytics templates.'}, {name: 'Nuuron', why: 'Retention decisions for operations.'}],
        },
      },
      {
        id: 'sa-advisor', name: 'Advisor portal enhancements', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 500, tcv: 1000, winPct: 75, expectedClose: '2026-10-16', plannedMarginPct: 33, competitors: ['In-house'], dealTeam: ['Varun Khanna', 'Rohan Joshi'],
        expansion: {project: 'Advisor Portal'},
        detail: {
          scope: 'E-signature and illustration tools for financial advisers.',
          decisionMakers: ['Robert Klein'],
          whyWeWin: 'We built the portal; scope agreed.',
          risks: ['Signature date could slip a month'],
          nextSteps: [
            {step: 'Final scope sign-off', owner: 'Rohan Joshi', due: '2026-10-12'},
            {step: 'Contract signature', owner: 'Varun Khanna', due: '2026-10-16'},
            {step: 'Mobilise team', owner: 'Rohan Joshi', due: '2026-11-02'},
          ],
          products: [{name: 'Forge-X', why: 'Quick delivery of new adviser tools.'}],
        },
      },
      {
        id: 'sa-renewal', name: 'Cloud operations renewal', type: 'Renewal', serviceLine: 'Cloud & Infra', status: 'Active', stage: 'Negotiation',
        annualValue: 630, tcv: 1260, winPct: 85, expectedClose: '2026-11-27', plannedMarginPct: 27, competitors: ['TCS'], dealTeam: ['Varun Khanna', 'Rohan Joshi'],
        renewal: {currentAnnualValue: 600, contractEnd: '2026-12-31', status: 'Under negotiation'},
        detail: {
          scope: 'Two-year cloud operations renewal with 5% uplift for added services.',
          decisionMakers: ['Robert Klein'],
          whyWeWin: 'Strong service record; CIO is consolidating vendors.',
          risks: ['Small risk of bundling with TCS'],
          nextSteps: [
            {step: 'Service review', owner: 'Rohan Joshi', due: '2026-10-22'},
            {step: 'Agree uplift', owner: 'Varun Khanna', due: '2026-11-12'},
            {step: 'Signature', owner: 'Varun Khanna', due: '2026-11-26'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Supports the added services at low cost.'}],
        },
      },
      {
        id: 'sa-won-qe', name: 'Contact centre test automation', type: 'Expansion', serviceLine: 'Quality Engineering', status: 'Won',
        annualValue: 300, tcv: 600, expectedClose: '2026-06-24', plannedMarginPct: 34, competitors: ['In-house'], dealTeam: ['Varun Khanna'],
        expansion: {project: 'Advisor Portal'},
      },
      {
        id: 'sa-lost-portal', name: 'Retirement portal rebuild', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Lost',
        annualValue: 450, tcv: 900, expectedClose: '2025-12-05', plannedMarginPct: 31, competitors: ['TCS'], dealTeam: ['Varun Khanna'],
        expansion: {project: 'Retirement Portal'},
      },
    ],
  },
  {
    id: 'beacon-mutual',
    fy26Revenue: 1500, fy26YtdRevenue: 730, fy27YtdRevenue: 800, securedFy27Revenue: 1550, itSpend: 6000, fy26YtdWonValue: 300,
    serviceLines: SL([1800, true], [1500, false], [1200, true], [1000, true], [500, false]),
    competitorSpend: {Cognizant: 400, LTIMindtree: 800},
    contracts: [
      {id: 'bm-c1', competitor: 'Cognizant', serviceLine: 'Quality Engineering', scope: 'Testing centre of excellence', annualValue: 400, endDate: '2027-05-31', satisfaction: 'Medium'},
      {id: 'bm-c2', competitor: 'LTIMindtree', serviceLine: 'Data & AI', scope: 'Member data warehouse', annualValue: 800, endDate: '2028-11-30', satisfaction: 'Medium'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'Sarah Lindqvist', role: 'CIO', strength: 'Medium'},
      {name: 'Tom Becker', role: 'Head of Member Services', strength: 'Strong'},
    ],
    signals: [
      {tone: 'positive', text: 'Member services wants a single view of the member'},
      {tone: 'watch', text: 'Testing CoE contract with Cognizant ends May 2027'},
    ],
    noOpportunity: {
      Renewal: 'No contract ending in the next 12 months',
      'New division/region': 'Single-division mutual',
    },
    opportunities: [
      {
        id: 'bm-insights', name: 'Member insights platform', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Active', stage: 'Proposal',
        annualValue: 600, tcv: 1800, winPct: 30, expectedClose: '2026-12-11', plannedMarginPct: 31, competitors: ['LTIMindtree'], dealTeam: ['Ishita Bose', 'Laura Bennett'],
        detail: {
          scope: 'Single member view and next-best-action for member services.',
          decisionMakers: ['Tom Becker', 'Sarah Lindqvist'],
          whyWeWin: 'Strong sponsor in member services; we know the policy systems.',
          risks: ['LTIMindtree owns the member data warehouse'],
          nextSteps: [
            {step: 'Member journey workshop', owner: 'Laura Bennett', due: '2026-10-29'},
            {step: 'Proof on one product line', owner: 'Laura Bennett', due: '2026-11-19'},
            {step: 'Submit proposal', owner: 'Ishita Bose', due: '2026-12-03'},
          ],
          products: [{name: 'Data Cosmos', why: 'Member 360 accelerator.'}, {name: 'Nuuron', why: 'Next-best-action decisions.'}],
        },
      },
      {
        id: 'bm-testing', name: 'Testing CoE takeover from Cognizant', type: 'Competitor takeover', serviceLine: 'Quality Engineering', status: 'Active', stage: 'Qualified',
        annualValue: 350, tcv: 1050, winPct: 25, expectedClose: '2027-04-30', plannedMarginPct: 33, competitors: ['Cognizant'], dealTeam: ['Ishita Bose'],
        takeover: {contractId: 'bm-c1'},
        detail: {
          scope: 'Run the testing centre of excellence from June 2027.',
          decisionMakers: ['Sarah Lindqvist'],
          whyWeWin: 'Automation-first testing cuts cycle time; we already test our own releases.',
          risks: ['Cognizant relationship is long-standing'],
          nextSteps: [
            {step: 'Test maturity assessment', owner: 'Ishita Bose', due: '2026-11-16'},
            {step: 'Share automation benchmark', owner: 'Ishita Bose', due: '2026-12-07'},
            {step: 'Agree RFP timeline', owner: 'Ishita Bose', due: '2027-01-18'},
          ],
          products: [{name: 'BlueSwan', why: 'Quality engineering platform for automation-first testing.'}],
        },
      },
      {
        id: 'bm-servicing', name: 'Policy servicing portal – wave 2', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 300, tcv: 600, winPct: 70, expectedClose: '2026-11-06', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Ishita Bose', 'Rohan Joshi'],
        expansion: {project: 'Policy Servicing Portal'},
        detail: {
          scope: 'Self-service changes and payments for members.',
          decisionMakers: ['Tom Becker'],
          whyWeWin: 'Wave 1 delivered; sponsor wants continuity.',
          risks: ['Small budget could be cut'],
          nextSteps: [
            {step: 'Confirm wave 2 scope', owner: 'Rohan Joshi', due: '2026-10-19'},
            {step: 'Agree price', owner: 'Ishita Bose', due: '2026-10-29'},
            {step: 'Sign', owner: 'Ishita Bose', due: '2026-11-05'},
          ],
          products: [{name: 'Forge-X', why: 'Fast delivery on the existing portal.'}],
        },
      },
      {
        id: 'bm-won-claims', name: 'Claims app enhancements', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Won',
        annualValue: 250, tcv: 500, expectedClose: '2026-09-18', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Ishita Bose'],
        expansion: {project: 'Claims App'},
      },
      {
        id: 'bm-lost-cloud', name: 'Cloud migration wave 2', type: 'Expansion', serviceLine: 'Cloud & Infra', status: 'Lost',
        annualValue: 300, tcv: 600, expectedClose: '2026-01-21', plannedMarginPct: 27, competitors: ['Cognizant'], dealTeam: ['Ishita Bose'],
        expansion: {project: 'Cloud Migration'},
      },
    ],
  },
  // ---------------------------------------------------------------- Insurance · Property & Casualty
  {
    id: 'shield-property-insurance',
    fy26Revenue: 3000, fy26YtdRevenue: 1460, fy27YtdRevenue: 1600, securedFy27Revenue: 3100, itSpend: 11000, fy26YtdWonValue: 600,
    serviceLines: SL([3000, true], [2500, false], [2000, true], [2800, true], [700, true]),
    competitorSpend: {Accenture: 2000, Cognizant: 1200},
    contracts: [
      {id: 'sp-c1', competitor: 'Cognizant', serviceLine: 'Enterprise Apps', scope: 'Guidewire application support', annualValue: 1200, endDate: '2027-06-30', satisfaction: 'Low'},
      {id: 'sp-c2', competitor: 'Accenture', serviceLine: 'Data & AI', scope: 'Pricing and risk analytics', annualValue: 2000, endDate: '2028-10-31', satisfaction: 'Medium'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'Martin Cole', role: 'CIO', strength: 'Strong'},
      {name: 'Priya Desai', role: 'Chief Claims Officer', strength: 'Medium'},
      {name: 'Alan Reed', role: 'CFO', strength: 'Weak'},
    ],
    signals: [
      {tone: 'positive', text: 'Claims leadership wants AI to cut claims cycle time by 20%'},
      {tone: 'risk', text: 'Guidewire support quality from Cognizant raised at the board'},
    ],
    noOpportunity: {'New division/region': 'Personal and commercial lines both served'},
    opportunities: [
      {
        id: 'sp-claimsdata', name: 'Claims data & AI platform', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Active', stage: 'Proposal',
        annualValue: 2000, tcv: 10000, winPct: 35, expectedClose: '2027-01-29', plannedMarginPct: 31, competitors: ['Accenture', 'Infosys'], dealTeam: ['Ryan Mitchell', 'Laura Bennett', 'Hannah Lee'],
        detail: {
          scope: 'Five-year claims data platform with fraud and triage AI, built around the Guidewire claims system.',
          decisionMakers: ['Priya Desai', 'Martin Cole', 'Alan Reed'],
          whyWeWin: 'Claims sponsor wants speed; we can show triage AI live at another insurer.',
          risks: ['Accenture runs pricing analytics and is bidding', 'CFO wants a 12-month payback'],
          nextSteps: [
            {step: 'Claims triage demo for the Chief Claims Officer', owner: 'Laura Bennett', due: '2026-10-22'},
            {step: 'Payback model with the CFO', owner: 'Ryan Mitchell', due: '2026-11-19'},
            {step: 'Submit proposal', owner: 'Ryan Mitchell', due: '2027-01-08'},
          ],
          products: [
            {name: 'Coforge Quasar', why: 'Runs fraud and triage models in production.'},
            {name: 'Data Cosmos', why: 'Claims data model and pipelines.'},
          ],
        },
      },
      {
        id: 'sp-guidewire', name: 'Guidewire support takeover from Cognizant', type: 'Competitor takeover', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Proposal',
        annualValue: 1100, tcv: 3300, winPct: 45, expectedClose: '2026-12-18', plannedMarginPct: 30, competitors: ['Cognizant'], dealTeam: ['Ryan Mitchell', 'Hannah Lee'],
        takeover: {contractId: 'sp-c1'},
        detail: {
          scope: 'Three-year Guidewire application support, starting with a parallel run in January.',
          decisionMakers: ['Martin Cole'],
          whyWeWin: 'Board concern about Cognizant service; we run Guidewire at three other insurers.',
          risks: ['Cognizant improvement plan may buy time'],
          nextSteps: [
            {step: 'Service health check of Guidewire estate', owner: 'Hannah Lee', due: '2026-10-30'},
            {step: 'Transition plan to the CIO', owner: 'Ryan Mitchell', due: '2026-11-20'},
            {step: 'Best and final offer', owner: 'Ryan Mitchell', due: '2026-12-11'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Faster incident resolution on Guidewire.'}, {name: 'BlueSwan', why: 'Automated Guidewire regression testing.'}],
        },
      },
      {
        id: 'sp-renewal', name: 'Digital first notice of loss renewal', type: 'Renewal', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Proposal',
        annualValue: 1050, tcv: 2100, winPct: 70, expectedClose: '2027-01-22', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Ryan Mitchell', 'Hannah Lee'],
        renewal: {currentAnnualValue: 1000, contractEnd: '2027-02-28', status: 'Proposal submitted'},
        detail: {
          scope: 'Two-year renewal of digital claims reporting support.',
          decisionMakers: ['Priya Desai'],
          whyWeWin: 'Digital claims reporting adoption is 64%; claims team relies on us.',
          risks: ['Client building an in-house digital team'],
          nextSteps: [
            {step: 'Adoption review with claims', owner: 'Hannah Lee', due: '2026-11-11'},
            {step: 'Propose shared-team model', owner: 'Ryan Mitchell', due: '2026-12-09'},
            {step: 'Close terms', owner: 'Ryan Mitchell', due: '2027-01-20'},
          ],
          products: [{name: 'AIVA', why: 'Agentic development supports a smaller shared team.'}],
        },
      },
      {
        id: 'sp-selfservice', name: 'Policy self-service – phase 2', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Potential',
        annualValue: 400, tcv: 800, expectedClose: '2027-04-30', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Ryan Mitchell'],
        expansion: {project: 'Policy Self-Service'},
        detail: {
          scope: 'Mid-term changes and renewals online for personal lines.',
          decisionMakers: ['Martin Cole'],
          whyWeWin: 'Extends our phase 1 work.',
          risks: ['Not in FY27 budget'],
          nextSteps: [
            {step: 'Share phase 1 results', owner: 'Ryan Mitchell', due: '2026-11-05'},
            {step: 'Shape FY28 business case', owner: 'Ryan Mitchell', due: '2026-12-10'},
            {step: 'Qualify', owner: 'Ryan Mitchell', due: '2027-01-21'},
          ],
          products: [{name: 'Forge-X', why: 'Reuses phase 1 components.'}],
        },
      },
      {
        id: 'sp-won-uw', name: 'Underwriting workbench', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Won',
        annualValue: 500, tcv: 1000, expectedClose: '2026-05-29', plannedMarginPct: 32, competitors: ['Accenture'], dealTeam: ['Ryan Mitchell'],
        expansion: {project: 'Underwriting Workbench'},
      },
      {
        id: 'sp-lost-cat', name: 'Catastrophe modelling analytics', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 600, tcv: 1200, expectedClose: '2026-07-10', plannedMarginPct: 30, competitors: ['Accenture'], dealTeam: ['Ryan Mitchell'],
      },
    ],
  },
  {
    id: 'granite-casualty',
    fy26Revenue: 2000, fy26YtdRevenue: 960, fy27YtdRevenue: 1060, securedFy27Revenue: 2000, itSpend: 8000, fy26YtdWonValue: 400,
    serviceLines: SL([2200, true], [1800, false], [1500, true], [1800, true], [700, true]),
    competitorSpend: {TCS: 1200, LTIMindtree: 900},
    contracts: [
      {id: 'gc-c1', competitor: 'TCS', serviceLine: 'Data & AI', scope: 'Claims and policy reporting', annualValue: 1200, endDate: '2027-03-31', satisfaction: 'Medium'},
      {id: 'gc-c2', competitor: 'LTIMindtree', serviceLine: 'Cloud & Infra', scope: 'Cloud migration and hosting', annualValue: 900, endDate: '2028-08-31', satisfaction: 'High'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'James Whitaker', role: 'CIO', strength: 'Medium'},
      {name: 'Elena Russo', role: 'Head of Data', strength: 'Medium'},
    ],
    signals: [
      {tone: 'watch', text: 'TCS reporting contract ends March 2027; RFP expected in November'},
      {tone: 'positive', text: 'CIO praised claims portal delivery at the last QBR'},
    ],
    noOpportunity: {'New division/region': 'Specialty lines buy through group IT'},
    opportunities: [
      {
        id: 'gc-takeover', name: 'Data & AI takeover from TCS', type: 'Competitor takeover', serviceLine: 'Data & AI', status: 'Active', stage: 'Proposal',
        annualValue: 1000, tcv: 3000, winPct: 30, expectedClose: '2027-01-15', plannedMarginPct: 30, competitors: ['TCS', 'Accenture'], dealTeam: ['Pooja Agarwal', 'Laura Bennett'],
        takeover: {contractId: 'gc-c1'},
        detail: {
          scope: 'Take over claims and policy reporting and move it to a modern data platform.',
          decisionMakers: ['Elena Russo', 'James Whitaker'],
          whyWeWin: 'Modern platform at the same run cost; strong delivery record on claims portal.',
          risks: ['TCS incumbent with low switching cost', 'Accenture also bidding'],
          nextSteps: [
            {step: 'Respond to RFP', owner: 'Pooja Agarwal', due: '2026-11-27'},
            {step: 'Orals with Head of Data', owner: 'Laura Bennett', due: '2026-12-10'},
            {step: 'Best and final offer', owner: 'Pooja Agarwal', due: '2027-01-08'},
          ],
          products: [{name: 'Data Cosmos', why: 'Insurance reporting accelerators.'}],
        },
      },
      {
        id: 'gc-fraud', name: 'Fraud analytics', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Potential',
        annualValue: 500, tcv: 1500, expectedClose: '2027-06-30', plannedMarginPct: 31, competitors: ['Accenture'], dealTeam: ['Pooja Agarwal'],
        detail: {
          scope: 'Claims fraud scoring once reporting moves to the new platform.',
          decisionMakers: ['Elena Russo'],
          whyWeWin: 'Follows the reporting takeover.',
          risks: ['Depends on winning the takeover'],
          nextSteps: [
            {step: 'Include fraud use case in RFP response', owner: 'Pooja Agarwal', due: '2026-11-27'},
            {step: 'Size the benefit with claims', owner: 'Pooja Agarwal', due: '2027-01-15'},
            {step: 'Qualify', owner: 'Pooja Agarwal', due: '2027-02-26'},
          ],
          products: [{name: 'Coforge Quasar', why: 'Fraud models on the AI platform.'}],
        },
      },
      {
        id: 'gc-portal', name: 'Claims portal modernisation', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 600, tcv: 1200, winPct: 65, expectedClose: '2026-11-20', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Pooja Agarwal', 'Hannah Lee'],
        expansion: {project: 'Claims Portal'},
        detail: {
          scope: 'Broker claims portal and document upload.',
          decisionMakers: ['James Whitaker'],
          whyWeWin: 'CIO praised our delivery; scope agreed.',
          risks: ['Budget approval in November'],
          nextSteps: [
            {step: 'Agree scope', owner: 'Hannah Lee', due: '2026-10-21'},
            {step: 'Price', owner: 'Pooja Agarwal', due: '2026-11-04'},
            {step: 'Sign', owner: 'Pooja Agarwal', due: '2026-11-18'},
          ],
          products: [{name: 'Forge-X', why: 'Fast build on the existing portal.'}],
        },
      },
      {
        id: 'gc-renewal', name: 'Policy admin support renewal', type: 'Renewal', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Negotiation',
        annualValue: 900, tcv: 2700, winPct: 80, expectedClose: '2026-11-27', plannedMarginPct: 31, competitors: ['TCS'], dealTeam: ['Pooja Agarwal', 'Hannah Lee'],
        renewal: {currentAnnualValue: 900, contractEnd: '2026-12-31', status: 'Under negotiation'},
        detail: {
          scope: 'Three-year policy admin support renewal at flat price.',
          decisionMakers: ['James Whitaker'],
          whyWeWin: 'Stable service; flat price offered for three years.',
          risks: ['TCS pitching policy admin with reporting'],
          nextSteps: [
            {step: 'Service review', owner: 'Hannah Lee', due: '2026-10-20'},
            {step: 'Agree terms', owner: 'Pooja Agarwal', due: '2026-11-10'},
            {step: 'Sign', owner: 'Pooja Agarwal', due: '2026-11-25'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Holds price flat through automation.'}],
        },
      },
      {
        id: 'gc-won-billing', name: 'Billing system upgrade', type: 'Expansion', serviceLine: 'Enterprise Apps', status: 'Won',
        annualValue: 400, tcv: 800, expectedClose: '2026-04-17', plannedMarginPct: 31, competitors: ['TCS'], dealTeam: ['Pooja Agarwal'],
        expansion: {project: 'Billing'},
      },
      {
        id: 'gc-lost-cloud', name: 'Cloud migration wave 3', type: 'Expansion', serviceLine: 'Cloud & Infra', status: 'Lost',
        annualValue: 500, tcv: 1000, expectedClose: '2026-03-05', plannedMarginPct: 27, competitors: ['LTIMindtree'], dealTeam: ['Pooja Agarwal'],
        expansion: {project: 'Cloud Migration'},
      },
    ],
  },
  // ---------------------------------------------------------------- Travel · Airlines
  {
    id: 'skybridge-airways',
    fy26Revenue: 4500, fy26YtdRevenue: 2150, fy27YtdRevenue: 2520, securedFy27Revenue: 4580, itSpend: 14000, fy26YtdWonValue: 900,
    serviceLines: SL([4500, true], [3000, true], [3000, true], [2500, true], [1000, true]),
    competitorSpend: {Accenture: 2500, TCS: 1500},
    contracts: [
      {id: 'sb-c1', competitor: 'Accenture', serviceLine: 'Digital Engineering', scope: 'Loyalty platform', annualValue: 2500, endDate: '2029-03-31', satisfaction: 'High'},
      {id: 'sb-c2', competitor: 'TCS', serviceLine: 'Enterprise Apps', scope: 'Revenue accounting', annualValue: 1500, endDate: '2028-12-31', satisfaction: 'Medium'},
    ],
    divisions: [{name: 'Cargo', spend: 1800, sponsorIdentified: true}],
    stakeholders: [
      {name: 'Thomas Reid', role: 'CIO', strength: 'Strong'},
      {name: 'Maya Patel', role: 'VP Network Operations', strength: 'Strong'},
      {name: 'Victor Lin', role: 'Head of Cargo', strength: 'Weak'},
    ],
    signals: [
      {tone: 'positive', text: 'Network operations wants crew scheduling on all fleets by FY28'},
      {tone: 'risk', text: 'Accenture offering crew optimisation as part of a wider operations deal'},
      {tone: 'watch', text: 'Crew Scheduling Platform delivery is red on margin'},
    ],
    noOpportunity: {
      'Cross-sell': 'Buys all 5 service lines',
      'Competitor takeover': 'No competitor contract expiring in 18 months',
    },
    opportunities: [
      {
        id: 'sb-crew', name: 'Crew scheduling – network-wide rollout', type: 'Expansion', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Proposal',
        annualValue: 3000, tcv: 12000, winPct: 45, expectedClose: '2026-10-30', plannedMarginPct: 28, competitors: ['Accenture', 'In-house'], dealTeam: ['Ananya Singh', 'Sanjay Rao', 'Amit Verma'],
        expansion: {project: 'Crew Scheduling Platform'},
        detail: {
          scope: 'Four-year rollout of the crew scheduling platform from narrow-body to all fleets and bases.',
          decisionMakers: ['Maya Patel', 'Thomas Reid'],
          whyWeWin: 'Platform already live on narrow-body fleet; crew disruption costs fell 9%.',
          risks: ['Accenture bundling crew optimisation with a wider operations deal', 'Current project is red on margin, which weakens our price'],
          nextSteps: [
            {step: 'Fix project margin plan before final pricing', owner: 'Amit Verma', due: '2026-10-16'},
            {step: 'Executive session with VP Network Operations', owner: 'Ananya Singh', due: '2026-10-20'},
            {step: 'Best and final offer', owner: 'Ananya Singh', due: '2026-10-27'},
          ],
          products: [
            {name: 'Nuuron', why: 'Decision intelligence for crew disruption recovery.'},
            {name: 'Forge-X', why: 'Faster fleet-by-fleet rollout protects margin.'},
          ],
        },
      },
      {
        id: 'sb-pricing', name: 'Dynamic pricing engine extension', type: 'Expansion', serviceLine: 'Data & AI', status: 'Active', stage: 'Negotiation',
        annualValue: 800, tcv: 1600, winPct: 65, expectedClose: '2026-11-20', plannedMarginPct: 32, competitors: ['Accenture'], dealTeam: ['Ananya Singh', 'Sanjay Rao'],
        expansion: {project: 'Dynamic Pricing'},
        detail: {
          scope: 'Extend dynamic pricing to ancillaries and long-haul routes.',
          decisionMakers: ['Thomas Reid'],
          whyWeWin: 'Short-haul pricing lifted revenue per seat 2%.',
          risks: ['Accenture pitching a full revenue management suite'],
          nextSteps: [
            {step: 'Share revenue uplift results', owner: 'Sanjay Rao', due: '2026-10-22'},
            {step: 'Agree price', owner: 'Ananya Singh', due: '2026-11-06'},
            {step: 'Sign', owner: 'Ananya Singh', due: '2026-11-18'},
          ],
          products: [{name: 'Coforge Quasar', why: 'Runs pricing models at scale.'}],
        },
      },
      {
        id: 'sb-renewal', name: 'Airport operations support renewal', type: 'Renewal', serviceLine: 'Cloud & Infra', status: 'Active', stage: 'Negotiation',
        annualValue: 840, tcv: 1680, winPct: 85, expectedClose: '2027-02-19', plannedMarginPct: 27, competitors: ['TCS'], dealTeam: ['Ananya Singh', 'Amit Verma'],
        renewal: {currentAnnualValue: 800, contractEnd: '2027-03-31', status: 'Under negotiation'},
        detail: {
          scope: 'Two-year renewal of airport systems support with 5% uplift.',
          decisionMakers: ['Thomas Reid'],
          whyWeWin: 'On-time performance support rated 4.4.',
          risks: ['Low risk'],
          nextSteps: [
            {step: 'Service review', owner: 'Amit Verma', due: '2026-11-12'},
            {step: 'Agree uplift', owner: 'Ananya Singh', due: '2027-01-14'},
            {step: 'Sign', owner: 'Ananya Singh', due: '2027-02-18'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Agentic operations for airport systems.'}],
        },
      },
      {
        id: 'sb-cargo', name: 'Cargo digital booking', type: 'New division/region', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Qualified',
        annualValue: 900, tcv: 2700, winPct: 25, expectedClose: '2027-01-29', plannedMarginPct: 31, competitors: ['Accenture'], dealTeam: ['Ananya Singh', 'Sanjay Rao'],
        newDivision: {division: 'Cargo'},
        detail: {
          scope: 'Online booking and tracking for cargo customers.',
          decisionMakers: ['Victor Lin'],
          whyWeWin: 'Sponsor identified; reuses passenger booking components.',
          risks: ['New relationship with Head of Cargo'],
          nextSteps: [
            {step: 'Discovery with cargo team', owner: 'Sanjay Rao', due: '2026-11-04'},
            {step: 'Shape proposal', owner: 'Ananya Singh', due: '2026-12-09'},
            {step: 'Submit', owner: 'Ananya Singh', due: '2027-01-13'},
          ],
          products: [{name: 'Forge-X', why: 'Reuses passenger booking components.'}],
        },
      },
      {
        id: 'sb-won-checkin', name: 'Mobile check-in rebuild', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Won',
        annualValue: 900, tcv: 1800, expectedClose: '2026-07-08', plannedMarginPct: 32, competitors: ['Accenture'], dealTeam: ['Ananya Singh'],
        expansion: {project: 'Mobile Check-in'},
      },
      {
        id: 'sb-lost-loyalty', name: 'Loyalty analytics', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 600, tcv: 1200, expectedClose: '2026-02-18', plannedMarginPct: 30, competitors: ['Accenture'], dealTeam: ['Ananya Singh'],
      },
    ],
  },
  {
    id: 'aurora-air',
    fy26Revenue: 2500, fy26YtdRevenue: 1200, fy27YtdRevenue: 1380, securedFy27Revenue: 2600, itSpend: 8000, fy26YtdWonValue: 500,
    serviceLines: SL([2400, true], [1800, true], [1600, true], [1400, false], [800, true]),
    competitorSpend: {Infosys: 1200},
    contracts: [
      {id: 'aa-c1', competitor: 'Infosys', serviceLine: 'Enterprise Apps', scope: 'Maintenance (MRO) system support', annualValue: 1200, endDate: '2027-08-31', satisfaction: 'Low'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'Grace Holm', role: 'CIO', strength: 'Strong'},
      {name: 'Peter Novak', role: 'Head of Engineering & Maintenance', strength: 'Medium'},
    ],
    signals: [
      {tone: 'positive', text: 'Maintenance team frustrated with Infosys response times'},
      {tone: 'positive', text: 'Ops control centre phase 1 went live two weeks early'},
    ],
    noOpportunity: {
      'Cross-sell': 'Only gap is Enterprise Apps, pursued as the Infosys takeover',
      Renewal: 'No contract ending in the next 12 months',
      'New division/region': 'Regional subsidiary buys through group IT',
    },
    opportunities: [
      {
        id: 'aa-occ', name: 'Ops control centre – phase 2', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 700, tcv: 1400, winPct: 65, expectedClose: '2026-11-13', plannedMarginPct: 31, competitors: ['In-house'], dealTeam: ['Chris Walker', 'Amit Verma'],
        expansion: {project: 'Ops Control Centre'},
        detail: {
          scope: 'Disruption management and passenger re-accommodation in the ops control centre.',
          decisionMakers: ['Grace Holm'],
          whyWeWin: 'Phase 1 went live early.',
          risks: ['Scope creep on integration'],
          nextSteps: [
            {step: 'Agree integration scope', owner: 'Amit Verma', due: '2026-10-20'},
            {step: 'Price', owner: 'Chris Walker', due: '2026-10-30'},
            {step: 'Sign', owner: 'Chris Walker', due: '2026-11-12'},
          ],
          products: [{name: 'Nuuron', why: 'Decision support for disruption recovery.'}],
        },
      },
      {
        id: 'aa-mro', name: 'MRO support takeover from Infosys', type: 'Competitor takeover', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Proposal',
        annualValue: 1000, tcv: 3000, winPct: 40, expectedClose: '2027-02-12', plannedMarginPct: 29, competitors: ['Infosys'], dealTeam: ['Chris Walker', 'Sanjay Rao'],
        takeover: {contractId: 'aa-c1'},
        detail: {
          scope: 'Three-year support of the maintenance system, with early transition from March 2027.',
          decisionMakers: ['Peter Novak', 'Grace Holm'],
          whyWeWin: 'Maintenance team unhappy with Infosys; we offer aircraft-on-ground response targets.',
          risks: ['Infosys may improve service before renewal'],
          nextSteps: [
            {step: 'Response-time benchmark for maintenance', owner: 'Sanjay Rao', due: '2026-11-10'},
            {step: 'Transition plan', owner: 'Chris Walker', due: '2026-12-08'},
            {step: 'Submit proposal', owner: 'Chris Walker', due: '2027-01-26'},
          ],
          products: [{name: 'CodeInsightAI', why: 'Fast knowledge transfer on the MRO code.'}, {name: 'EvolveOps.AI', why: 'Faster incident response.'}],
        },
      },
      {
        id: 'aa-ancillary', name: 'Ancillary revenue analytics', type: 'Expansion', serviceLine: 'Data & AI', status: 'Active', stage: 'Proposal',
        annualValue: 400, tcv: 800, winPct: 35, expectedClose: '2026-12-04', plannedMarginPct: 31, competitors: ['Accenture'], dealTeam: ['Chris Walker', 'Sanjay Rao'],
        expansion: {project: 'Commercial Data Hub'},
        detail: {
          scope: 'Bag, seat and upgrade offer analytics on the commercial data hub.',
          decisionMakers: ['Grace Holm'],
          whyWeWin: 'Built on our data hub.',
          risks: ['Competing priorities for the commercial team'],
          nextSteps: [
            {step: 'Use-case workshop', owner: 'Sanjay Rao', due: '2026-10-28'},
            {step: 'Submit proposal', owner: 'Chris Walker', due: '2026-11-18'},
            {step: 'Decision', owner: 'Chris Walker', due: '2026-12-02'},
          ],
          products: [{name: 'Data Cosmos', why: 'Commercial analytics templates.'}],
        },
      },
      {
        id: 'aa-won-qe', name: 'Crew app test automation', type: 'Expansion', serviceLine: 'Quality Engineering', status: 'Won',
        annualValue: 300, tcv: 600, expectedClose: '2026-05-12', plannedMarginPct: 34, competitors: ['In-house'], dealTeam: ['Chris Walker'],
        expansion: {project: 'Crew App'},
      },
      {
        id: 'aa-lost-cloud', name: 'Cloud cost optimisation', type: 'Expansion', serviceLine: 'Cloud & Infra', status: 'Lost',
        annualValue: 250, tcv: 500, expectedClose: '2025-10-28', plannedMarginPct: 27, competitors: ['TCS'], dealTeam: ['Chris Walker'],
        expansion: {project: 'Cloud Operations'},
      },
    ],
  },
  {
    id: 'pacific-jetlines',
    fy26Revenue: 1500, fy26YtdRevenue: 720, fy27YtdRevenue: 800, securedFy27Revenue: 1500, itSpend: 6500, fy26YtdWonValue: 300,
    serviceLines: SL([2000, true], [1500, false], [1300, true], [1100, true], [600, false]),
    competitorSpend: {Cognizant: 700},
    contracts: [
      {id: 'pj-c1', competitor: 'Cognizant', serviceLine: 'Data & AI', scope: 'Operational reporting', annualValue: 700, endDate: '2029-04-30', satisfaction: 'Medium'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'Hiro Tanaka', role: 'CIO', strength: 'Medium'},
      {name: 'Olga Petrova', role: 'Chief Commercial Officer', strength: 'Medium'},
    ],
    signals: [
      {tone: 'positive', text: 'Commercial team wants revenue management data in one place'},
      {tone: 'watch', text: 'Release defects delayed two booking engine drops this year'},
    ],
    noOpportunity: {
      Renewal: 'No contract ending in the next 12 months',
      'New division/region': 'Single-division carrier',
      'Competitor takeover': 'No competitor contract expiring in 18 months',
    },
    opportunities: [
      {
        id: 'pj-revenue', name: 'Revenue management data platform', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Active', stage: 'Proposal',
        annualValue: 500, tcv: 1500, winPct: 40, expectedClose: '2026-12-11', plannedMarginPct: 31, competitors: ['Cognizant'], dealTeam: ['Manish Tiwari', 'Sanjay Rao'],
        detail: {
          scope: 'Bring booking, pricing and competitor fare data together for revenue management.',
          decisionMakers: ['Olga Petrova'],
          whyWeWin: 'We run the booking engine data feeds.',
          risks: ['Cognizant runs operational reporting'],
          nextSteps: [
            {step: 'Data workshop with commercial team', owner: 'Sanjay Rao', due: '2026-10-27'},
            {step: 'Submit proposal', owner: 'Manish Tiwari', due: '2026-11-24'},
            {step: 'Decision', owner: 'Manish Tiwari', due: '2026-12-09'},
          ],
          products: [{name: 'Data Cosmos', why: 'Airline commercial data model.'}],
        },
      },
      {
        id: 'pj-testing', name: 'Test automation centre of excellence', type: 'Cross-sell', serviceLine: 'Quality Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 250, tcv: 500, winPct: 65, expectedClose: '2026-10-28', plannedMarginPct: 34, competitors: ['In-house'], dealTeam: ['Manish Tiwari', 'Amit Verma'],
        detail: {
          scope: 'Automated regression for booking engine releases.',
          decisionMakers: ['Hiro Tanaka'],
          whyWeWin: 'Two delayed releases this year; CIO wants a fix now.',
          risks: ['Budget is small'],
          nextSteps: [
            {step: 'Share automation plan', owner: 'Amit Verma', due: '2026-10-14'},
            {step: 'Agree price', owner: 'Manish Tiwari', due: '2026-10-21'},
            {step: 'Sign', owner: 'Manish Tiwari', due: '2026-10-27'},
          ],
          products: [{name: 'BlueSwan', why: 'Quality engineering platform for release automation.'}],
        },
      },
      {
        id: 'pj-booking', name: 'Booking engine upgrade', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Proposal',
        annualValue: 400, tcv: 800, winPct: 40, expectedClose: '2026-11-27', plannedMarginPct: 31, competitors: ['In-house'], dealTeam: ['Manish Tiwari', 'Amit Verma'],
        expansion: {project: 'Booking Engine'},
        detail: {
          scope: 'Upgrade booking engine for NDC offers and bundles.',
          decisionMakers: ['Olga Petrova', 'Hiro Tanaka'],
          whyWeWin: 'We own the booking engine code.',
          risks: ['Release quality concerns'],
          nextSteps: [
            {step: 'Fix release quality first', owner: 'Amit Verma', due: '2026-10-30'},
            {step: 'Submit proposal', owner: 'Manish Tiwari', due: '2026-11-13'},
            {step: 'Decision', owner: 'Manish Tiwari', due: '2026-11-26'},
          ],
          products: [{name: 'AIVA', why: 'Agentic development for faster, safer releases.'}],
        },
      },
      {
        id: 'pj-won-web', name: 'Website rebuild', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Won',
        annualValue: 350, tcv: 700, expectedClose: '2026-08-21', plannedMarginPct: 32, competitors: ['Cognizant'], dealTeam: ['Manish Tiwari'],
        expansion: {project: 'Website'},
      },
      {
        id: 'pj-lost-ops', name: 'Operations reporting refresh', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 250, tcv: 500, expectedClose: '2026-01-29', plannedMarginPct: 30, competitors: ['Cognizant'], dealTeam: ['Manish Tiwari'],
      },
    ],
  },
  // ---------------------------------------------------------------- Travel · Hospitality
  {
    id: 'grand-vista-hotels',
    fy26Revenue: 3000, fy26YtdRevenue: 1430, fy27YtdRevenue: 1660, securedFy27Revenue: 2990, itSpend: 9500, fy26YtdWonValue: 600,
    serviceLines: SL([3000, true], [2000, true], [2000, false], [1800, true], [700, true]),
    competitorSpend: {LTIMindtree: 1500, Accenture: 1000},
    contracts: [
      {id: 'gv-c1', competitor: 'LTIMindtree', serviceLine: 'Cloud & Infra', scope: 'Cloud hosting', annualValue: 1500, endDate: '2028-09-30', satisfaction: 'Medium'},
      {id: 'gv-c2', competitor: 'Accenture', serviceLine: 'Data & AI', scope: 'Revenue management analytics', annualValue: 1000, endDate: '2028-11-30', satisfaction: 'High'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'Isabel Romero', role: 'Chief Digital Officer', strength: 'Strong'},
      {name: 'Nathan Ford', role: 'CIO', strength: 'Medium'},
      {name: 'Sofia Marin', role: 'VP Loyalty', strength: 'Medium'},
    ],
    signals: [
      {tone: 'positive', text: 'Board approved a global guest experience programme for FY27–FY31'},
      {tone: 'risk', text: 'Accenture shortlisted alongside us for the global rollout'},
    ],
    noOpportunity: {
      'New division/region': 'City hotels and resorts both served',
      'Competitor takeover': 'No competitor contract expiring in 18 months',
    },
    opportunities: [
      {
        id: 'gv-guest', name: 'Guest experience platform – global rollout', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Proposal',
        annualValue: 2100, tcv: 10500, winPct: 45, expectedClose: '2026-11-20', plannedMarginPct: 30, competitors: ['Accenture', 'Infosys'], dealTeam: ['Emma Scott', 'Sanjay Rao', 'Olivia Martin'],
        expansion: {project: 'Guest Experience Platform'},
        detail: {
          scope: 'Five-year rollout of the guest app, check-in and loyalty experience to all 180 hotels.',
          decisionMakers: ['Isabel Romero', 'Nathan Ford'],
          whyWeWin: 'Pilot in 20 hotels raised guest scores by 6 points; we know the property systems.',
          risks: ['Accenture shortlisted with a global delivery promise', 'Price pressure on a five-year deal'],
          nextSteps: [
            {step: 'Pilot results to the Chief Digital Officer', owner: 'Emma Scott', due: '2026-10-15'},
            {step: 'Orals with the selection panel', owner: 'Sanjay Rao', due: '2026-10-29'},
            {step: 'Best and final offer', owner: 'Emma Scott', due: '2026-11-12'},
          ],
          products: [
            {name: 'Forge-X', why: 'AI-native engineering speeds the hotel-by-hotel rollout.'},
            {name: 'Nuuron', why: 'Personalised offers for guests.'},
          ],
        },
      },
      {
        id: 'gv-loyalty', name: 'Loyalty personalisation – phase 2', type: 'Expansion', serviceLine: 'Data & AI', status: 'Active', stage: 'Negotiation',
        annualValue: 500, tcv: 1000, winPct: 65, expectedClose: '2026-10-23', plannedMarginPct: 32, competitors: ['Accenture'], dealTeam: ['Emma Scott', 'Sanjay Rao'],
        expansion: {project: 'Loyalty Personalisation'},
        detail: {
          scope: 'Personalised offers for loyalty members across booking channels.',
          decisionMakers: ['Sofia Marin'],
          whyWeWin: 'Phase 1 lifted offer take-up 14%.',
          risks: ['Accenture runs revenue analytics'],
          nextSteps: [
            {step: 'Agree phase 2 scope', owner: 'Sanjay Rao', due: '2026-10-12'},
            {step: 'Price', owner: 'Emma Scott', due: '2026-10-16'},
            {step: 'Sign', owner: 'Emma Scott', due: '2026-10-22'},
          ],
          products: [{name: 'Coforge Quasar', why: 'Runs personalisation models.'}],
        },
      },
      {
        id: 'gv-cloud', name: 'Cloud landing zone and FinOps', type: 'Cross-sell', serviceLine: 'Cloud & Infra', status: 'Potential',
        annualValue: 600, tcv: 1800, expectedClose: '2027-05-31', plannedMarginPct: 27, competitors: ['LTIMindtree'], dealTeam: ['Emma Scott'],
        detail: {
          scope: 'Cloud landing zone for the guest platform and cost management.',
          decisionMakers: ['Nathan Ford'],
          whyWeWin: 'Follows the guest platform rollout.',
          risks: ['LTIMindtree hosts the current estate'],
          nextSteps: [
            {step: 'Cloud cost review', owner: 'Emma Scott', due: '2026-11-18'},
            {step: 'Shape proposal', owner: 'Emma Scott', due: '2027-01-20'},
            {step: 'Qualify', owner: 'Emma Scott', due: '2027-02-24'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Cloud operations and FinOps automation.'}],
        },
      },
      {
        id: 'gv-renewal', name: 'Property systems integration renewal', type: 'Renewal', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Negotiation',
        annualValue: 620, tcv: 1240, winPct: 85, expectedClose: '2026-11-27', plannedMarginPct: 30, competitors: ['In-house'], dealTeam: ['Emma Scott', 'Olivia Martin'],
        renewal: {currentAnnualValue: 600, contractEnd: '2026-12-31', status: 'Under negotiation'},
        detail: {
          scope: 'Two-year renewal of property management system integration support.',
          decisionMakers: ['Nathan Ford'],
          whyWeWin: 'Stable service across 180 hotels.',
          risks: ['Low risk'],
          nextSteps: [
            {step: 'Service review', owner: 'Olivia Martin', due: '2026-10-21'},
            {step: 'Agree terms', owner: 'Emma Scott', due: '2026-11-11'},
            {step: 'Sign', owner: 'Emma Scott', due: '2026-11-25'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Automated integration monitoring.'}],
        },
      },
      {
        id: 'gv-won-qe', name: 'Booking app test automation', type: 'Expansion', serviceLine: 'Quality Engineering', status: 'Won',
        annualValue: 400, tcv: 800, expectedClose: '2026-06-05', plannedMarginPct: 34, competitors: ['In-house'], dealTeam: ['Emma Scott'],
        expansion: {project: 'Guest Experience Platform'},
      },
      {
        id: 'gv-lost-rm', name: 'Revenue management analytics', type: 'Expansion', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 450, tcv: 900, expectedClose: '2025-11-25', plannedMarginPct: 30, competitors: ['Accenture'], dealTeam: ['Emma Scott'],
        expansion: {project: 'Commercial Analytics'},
      },
    ],
  },
  {
    id: 'coastal-resorts',
    fy26Revenue: 1500, fy26YtdRevenue: 720, fy27YtdRevenue: 830, securedFy27Revenue: 1450, itSpend: 5000, fy26YtdWonValue: 300,
    serviceLines: SL([1500, true], [1000, true], [1200, true], [900, false], [400, true]),
    competitorSpend: {Cognizant: 800},
    contracts: [
      {id: 'cr-c1', competitor: 'Cognizant', serviceLine: 'Enterprise Apps', scope: 'Property management system support', annualValue: 800, endDate: '2027-04-30', satisfaction: 'Medium'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'Lucas Bennett', role: 'CIO', strength: 'Medium'},
      {name: 'Amara Diallo', role: 'Head of Guest Experience', strength: 'Strong'},
    ],
    signals: [
      {tone: 'positive', text: 'Mobile bookings now 41% of revenue, up from 30%'},
      {tone: 'watch', text: 'Cognizant PMS contract ends April 2027'},
    ],
    noOpportunity: {
      'Cross-sell': 'Only gap is Enterprise Apps, pursued as the Cognizant takeover',
      Renewal: 'No contract ending in the next 12 months',
      'New division/region': 'Single-brand resort group',
    },
    opportunities: [
      {
        id: 'cr-mobile', name: 'Resort booking app – phase 2', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 500, tcv: 1000, winPct: 70, expectedClose: '2026-10-30', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Rohit Saxena', 'Olivia Martin'],
        expansion: {project: 'Resort Booking App'},
        detail: {
          scope: 'Spa, dining and activity booking in the resort app.',
          decisionMakers: ['Amara Diallo'],
          whyWeWin: 'Mobile bookings grew to 41% of revenue after phase 1.',
          risks: ['Low risk'],
          nextSteps: [
            {step: 'Final scope', owner: 'Olivia Martin', due: '2026-10-15'},
            {step: 'Price', owner: 'Rohit Saxena', due: '2026-10-22'},
            {step: 'Sign', owner: 'Rohit Saxena', due: '2026-10-29'},
          ],
          products: [{name: 'Forge-X', why: 'Fast build on the existing app.'}],
        },
      },
      {
        id: 'cr-pms', name: 'Property system support takeover from Cognizant', type: 'Competitor takeover', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Proposal',
        annualValue: 700, tcv: 2100, winPct: 35, expectedClose: '2027-01-29', plannedMarginPct: 29, competitors: ['Cognizant'], dealTeam: ['Rohit Saxena', 'Sanjay Rao'],
        takeover: {contractId: 'cr-c1'},
        detail: {
          scope: 'Three-year property management system support from February 2027.',
          decisionMakers: ['Lucas Bennett'],
          whyWeWin: 'We run PMS integration at Grand Vista; one partner for the guest stack.',
          risks: ['Cognizant incumbent and well regarded'],
          nextSteps: [
            {step: 'Grand Vista reference visit', owner: 'Rohit Saxena', due: '2026-11-12'},
            {step: 'Transition plan', owner: 'Sanjay Rao', due: '2026-12-10'},
            {step: 'Submit proposal', owner: 'Rohit Saxena', due: '2027-01-15'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Lower run cost for PMS support.'}],
        },
      },
      {
        id: 'cr-guestdata', name: 'Guest data platform – phase 2', type: 'Expansion', serviceLine: 'Data & AI', status: 'Active', stage: 'Proposal',
        annualValue: 300, tcv: 600, winPct: 35, expectedClose: '2026-12-18', plannedMarginPct: 31, competitors: ['In-house'], dealTeam: ['Rohit Saxena', 'Sanjay Rao'],
        expansion: {project: 'Guest Data Platform'},
        detail: {
          scope: 'Add spend and stay history for targeted offers.',
          decisionMakers: ['Amara Diallo'],
          whyWeWin: 'Extends our phase 1 platform.',
          risks: ['Team may build in-house'],
          nextSteps: [
            {step: 'Use-case review', owner: 'Sanjay Rao', due: '2026-11-04'},
            {step: 'Submit proposal', owner: 'Rohit Saxena', due: '2026-11-25'},
            {step: 'Decision', owner: 'Rohit Saxena', due: '2026-12-16'},
          ],
          products: [{name: 'Data Cosmos', why: 'Guest data model.'}],
        },
      },
      {
        id: 'cr-won-web', name: 'Website and booking engine', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Won',
        annualValue: 300, tcv: 600, expectedClose: '2026-04-28', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Rohit Saxena'],
        expansion: {project: 'Resort Booking App'},
      },
      {
        id: 'cr-lost-cloud', name: 'Cloud cost optimisation', type: 'Expansion', serviceLine: 'Cloud & Infra', status: 'Lost',
        annualValue: 200, tcv: 400, expectedClose: '2026-03-18', plannedMarginPct: 27, competitors: ['Cognizant'], dealTeam: ['Rohit Saxena'],
        expansion: {project: 'Cloud Operations'},
      },
    ],
  },
  // ---------------------------------------------------------------- Healthcare · Payers
  {
    id: 'blueriver-health-plan',
    fy26Revenue: 3500, fy26YtdRevenue: 1580, fy27YtdRevenue: 1930, securedFy27Revenue: 3500, itSpend: 15000, fy26YtdWonValue: 500,
    serviceLines: SL([4000, true], [3500, false], [3000, true], [3000, true], [1500, false]),
    competitorSpend: {Cognizant: 2500, Infosys: 1200},
    contracts: [
      {id: 'br-c1', competitor: 'Cognizant', serviceLine: 'Data & AI', scope: 'Claims and care analytics', annualValue: 2500, endDate: '2027-12-31', satisfaction: 'Low'},
      {id: 'br-c2', competitor: 'Infosys', serviceLine: 'Quality Engineering', scope: 'Testing services', annualValue: 1200, endDate: '2029-06-30', satisfaction: 'Medium'},
    ],
    divisions: [{name: 'Pharmacy Benefits', spend: 3000, sponsorIdentified: false}],
    stakeholders: [
      {name: 'Karen Liu', role: 'CIO', strength: 'Strong'},
      {name: 'Dr. Ahmed Malik', role: 'Chief Medical Information Officer', strength: 'Medium'},
      {name: 'Brian Foster', role: 'Head of Pharmacy Benefits', strength: 'Weak'},
    ],
    signals: [
      {tone: 'positive', text: 'CIO open to replacing Cognizant analytics when the contract ends in Dec 2027'},
      {tone: 'watch', text: 'Pharmacy benefits modernisation budget expected in FY28 planning'},
      {tone: 'positive', text: 'Medicare Advantage membership up 18%; member portal under strain'},
    ],
    noOpportunity: {'Cross-sell': 'Data & AI pursued as the Cognizant takeover; testing locked with Infosys to 2029'},
    opportunities: [
      {
        id: 'br-renewal', name: 'Claims platform support renewal', type: 'Renewal', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Negotiation',
        annualValue: 2000, tcv: 10000, winPct: 90, expectedClose: '2026-11-20', plannedMarginPct: 32, competitors: ['Cognizant'], dealTeam: ['Deepak Chauhan', 'Megan Ortiz', 'Sanjay Patel'],
        renewal: {currentAnnualValue: 2000, contractEnd: '2026-12-31', status: 'Under negotiation'},
        detail: {
          scope: 'Five-year renewal of claims platform support and upgrades at flat annual value.',
          decisionMakers: ['Karen Liu'],
          whyWeWin: 'Claims auto-adjudication rose to 82% under our support; CIO wants continuity.',
          risks: ['Five-year term needs board approval'],
          nextSteps: [
            {step: 'Board paper with the CIO', owner: 'Deepak Chauhan', due: '2026-10-23'},
            {step: 'Final service levels', owner: 'Sanjay Patel', due: '2026-11-06'},
            {step: 'Signature', owner: 'Deepak Chauhan', due: '2026-11-19'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Agentic operations keep price flat over five years.'}],
        },
      },
      {
        id: 'br-portal', name: 'Member portal – Medicare Advantage', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 600, tcv: 1200, winPct: 70, expectedClose: '2026-11-06', plannedMarginPct: 33, competitors: ['In-house'], dealTeam: ['Deepak Chauhan', 'Sanjay Patel'],
        expansion: {project: 'Member Portal'},
        detail: {
          scope: 'Scale the member portal for Medicare Advantage growth and add plan comparison.',
          decisionMakers: ['Karen Liu'],
          whyWeWin: 'We built the portal; membership growth makes it urgent.',
          risks: ['Low risk'],
          nextSteps: [
            {step: 'Capacity plan', owner: 'Sanjay Patel', due: '2026-10-16'},
            {step: 'Price', owner: 'Deepak Chauhan', due: '2026-10-27'},
            {step: 'Sign', owner: 'Deepak Chauhan', due: '2026-11-05'},
          ],
          products: [{name: 'Forge-X', why: 'Fast scaling of the portal.'}],
        },
      },
      {
        id: 'br-takeover', name: 'Analytics takeover from Cognizant', type: 'Competitor takeover', serviceLine: 'Data & AI', status: 'Potential',
        annualValue: 2200, tcv: 11000, expectedClose: '2027-09-30', plannedMarginPct: 30, competitors: ['Cognizant', 'Accenture'], dealTeam: ['Deepak Chauhan', 'Megan Ortiz'],
        takeover: {contractId: 'br-c1'},
        detail: {
          scope: 'Five-year claims and care analytics on a modern platform, replacing Cognizant from January 2028.',
          decisionMakers: ['Karen Liu', 'Dr. Ahmed Malik'],
          whyWeWin: 'CIO dissatisfied with Cognizant; we own the claims data feeds.',
          risks: ['Not yet a formal process', 'Accenture courting the CMIO'],
          nextSteps: [
            {step: 'Analytics maturity review with the CMIO', owner: 'Megan Ortiz', due: '2026-11-10'},
            {step: 'Shape a pilot on care gaps', owner: 'Megan Ortiz', due: '2026-12-08'},
            {step: 'Qualify into Active pipeline', owner: 'Deepak Chauhan', due: '2026-12-15'},
          ],
          products: [{name: 'Data Cosmos', why: 'Payer analytics data model.'}, {name: 'Nuuron', why: 'Care-gap decision support.'}],
        },
      },
      {
        id: 'br-pharmacy', name: 'Pharmacy benefits modernisation', type: 'New division/region', serviceLine: 'Digital Engineering', status: 'Potential',
        annualValue: 1500, tcv: 7500, expectedClose: '2027-06-30', plannedMarginPct: 31, competitors: ['Accenture'], dealTeam: ['Deepak Chauhan'],
        newDivision: {division: 'Pharmacy Benefits'},
        detail: {
          scope: 'Modernise the pharmacy benefits platform for the Pharmacy Benefits division.',
          decisionMakers: ['Brian Foster'],
          whyWeWin: 'Legacy modernisation strength; claims platform knowledge.',
          risks: ['No sponsor yet', 'FY28 budget'],
          nextSteps: [
            {step: 'CIO introduction to Head of Pharmacy Benefits', owner: 'Deepak Chauhan', due: '2026-11-03'},
            {step: 'Code assessment offer', owner: 'Megan Ortiz', due: '2026-12-01'},
            {step: 'Qualify FY28 budget', owner: 'Deepak Chauhan', due: '2027-01-19'},
          ],
          products: [{name: 'CodeInsightAI', why: 'Assesses and modernises the legacy pharmacy code.'}],
        },
      },
      {
        id: 'br-won-api', name: 'Provider directory APIs', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Won',
        annualValue: 500, tcv: 1000, expectedClose: '2026-07-22', plannedMarginPct: 33, competitors: ['Cognizant'], dealTeam: ['Deepak Chauhan'],
        expansion: {project: 'Member Portal'},
      },
      {
        id: 'br-lost-care', name: 'Care management analytics', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 550, tcv: 1100, expectedClose: '2026-01-14', plannedMarginPct: 30, competitors: ['Cognizant'], dealTeam: ['Deepak Chauhan'],
      },
    ],
  },
  {
    id: 'unity-health-insurance',
    fy26Revenue: 2000, fy26YtdRevenue: 900, fy27YtdRevenue: 1100, securedFy27Revenue: 2050, itSpend: 9000, fy26YtdWonValue: 300,
    serviceLines: SL([2500, true], [2000, false], [2000, true], [1600, true], [900, true]),
    competitorSpend: {TCS: 1500},
    contracts: [
      {id: 'uh-c1', competitor: 'TCS', serviceLine: 'Data & AI', scope: 'Enterprise data warehouse', annualValue: 1500, endDate: '2028-06-30', satisfaction: 'Medium'},
    ],
    divisions: [{name: 'Dental & Vision', spend: 1200, sponsorIdentified: false}],
    stakeholders: [
      {name: 'Michelle Tran', role: 'CIO', strength: 'Strong'},
      {name: 'Paul Herrera', role: 'VP Risk Adjustment', strength: 'Weak'},
    ],
    signals: [
      {tone: 'positive', text: 'Claims auto-adjudication phase 1 beat its target'},
      {tone: 'watch', text: 'Risk adjustment team evaluating analytics vendors for FY28'},
    ],
    noOpportunity: {'Competitor takeover': 'No competitor contract expiring in 18 months'},
    opportunities: [
      {
        id: 'uh-adjudication', name: 'Claims auto-adjudication – phase 2', type: 'Expansion', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Negotiation',
        annualValue: 500, tcv: 1000, winPct: 75, expectedClose: '2026-10-30', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Grace Liu', 'Sanjay Patel'],
        expansion: {project: 'Claims Auto-Adjudication'},
        detail: {
          scope: 'Extend auto-adjudication rules to behavioural health and dental claims.',
          decisionMakers: ['Michelle Tran'],
          whyWeWin: 'Phase 1 beat its target.',
          risks: ['Low risk'],
          nextSteps: [
            {step: 'Final scope', owner: 'Sanjay Patel', due: '2026-10-14'},
            {step: 'Price', owner: 'Grace Liu', due: '2026-10-21'},
            {step: 'Sign', owner: 'Grace Liu', due: '2026-10-29'},
          ],
          products: [{name: 'Coforge Quasar', why: 'AI rules for claims adjudication.'}],
        },
      },
      {
        id: 'uh-risk', name: 'Risk adjustment analytics', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Potential',
        annualValue: 800, tcv: 2400, expectedClose: '2027-04-30', plannedMarginPct: 31, competitors: ['TCS'], dealTeam: ['Grace Liu'],
        detail: {
          scope: 'Risk adjustment coding and analytics for Medicare Advantage members.',
          decisionMakers: ['Paul Herrera'],
          whyWeWin: 'Domain experience from BlueRiver.',
          risks: ['TCS runs the data warehouse', 'Weak sponsor relationship'],
          nextSteps: [
            {step: 'Meet VP Risk Adjustment', owner: 'Grace Liu', due: '2026-10-28'},
            {step: 'Share BlueRiver case', owner: 'Grace Liu', due: '2026-11-18'},
            {step: 'Qualify into Active pipeline', owner: 'Grace Liu', due: '2026-12-09'},
          ],
          products: [{name: 'Data Cosmos', why: 'Risk adjustment data model.'}, {name: 'Nuuron', why: 'Coding gap decisions.'}],
        },
      },
      {
        id: 'uh-renewal', name: 'Member app support renewal', type: 'Renewal', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 420, tcv: 840, winPct: 85, expectedClose: '2026-12-11', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Grace Liu', 'Sanjay Patel'],
        renewal: {currentAnnualValue: 400, contractEnd: '2027-01-31', status: 'Under negotiation'},
        detail: {
          scope: 'Two-year renewal of member app support with 5% uplift.',
          decisionMakers: ['Michelle Tran'],
          whyWeWin: 'App rating 4.6; low switching appetite.',
          risks: ['Low risk'],
          nextSteps: [
            {step: 'Service review', owner: 'Sanjay Patel', due: '2026-10-27'},
            {step: 'Agree uplift', owner: 'Grace Liu', due: '2026-11-17'},
            {step: 'Sign', owner: 'Grace Liu', due: '2026-12-10'},
          ],
          products: [{name: 'BlueSwan', why: 'Automated app regression supports the uplift.'}],
        },
      },
      {
        id: 'uh-dental', name: 'Dental & vision member platform', type: 'New division/region', serviceLine: 'Digital Engineering', status: 'Potential',
        annualValue: 400, tcv: 1200, expectedClose: '2027-06-30', plannedMarginPct: 31, competitors: ['In-house'], dealTeam: ['Grace Liu'],
        newDivision: {division: 'Dental & Vision'},
        detail: {
          scope: 'Member and provider portal for the Dental & Vision division.',
          decisionMakers: ['Michelle Tran'],
          whyWeWin: 'Reuses member app components.',
          risks: ['No sponsor in the division yet'],
          nextSteps: [
            {step: 'Ask CIO for an introduction', owner: 'Grace Liu', due: '2026-11-10'},
            {step: 'Discovery', owner: 'Grace Liu', due: '2026-12-08'},
            {step: 'Qualify', owner: 'Grace Liu', due: '2027-01-26'},
          ],
          products: [{name: 'Forge-X', why: 'Component reuse lowers entry price.'}],
        },
      },
      {
        id: 'uh-won-broker', name: 'Broker portal', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Won',
        annualValue: 300, tcv: 600, expectedClose: '2026-05-06', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Grace Liu'],
        expansion: {project: 'Broker Portal'},
      },
      {
        id: 'uh-lost-prior', name: 'Prior authorisation automation', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 350, tcv: 700, expectedClose: '2026-06-30', plannedMarginPct: 30, competitors: ['TCS'], dealTeam: ['Grace Liu'],
      },
    ],
  },
  {
    id: 'clearpath-benefits',
    fy26Revenue: 1000, fy26YtdRevenue: 450, fy27YtdRevenue: 540, securedFy27Revenue: 1050, itSpend: 4500, fy26YtdWonValue: 150,
    serviceLines: SL([1200, true], [1000, false], [1000, true], [900, true], [400, true]),
    competitorSpend: {LTIMindtree: 600},
    contracts: [
      {id: 'cp-c1', competitor: 'LTIMindtree', serviceLine: 'Data & AI', scope: 'Benefits reporting', annualValue: 600, endDate: '2029-01-31', satisfaction: 'Medium'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'Rachel Gomez', role: 'CTO', strength: 'Strong'},
      {name: 'Ian Murphy', role: 'COO', strength: 'Medium'},
    ],
    signals: [
      {tone: 'positive', text: 'Open enrolment volumes up 25%; portal upgrade is urgent'},
      {tone: 'watch', text: 'COO exploring claims analytics with LTIMindtree'},
    ],
    noOpportunity: {
      'New division/region': 'Single-line benefits administrator',
      'Competitor takeover': 'No competitor contract expiring in 18 months',
    },
    opportunities: [
      {
        id: 'cp-enrol', name: 'Benefits enrolment portal upgrade', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 200, tcv: 400, winPct: 70, expectedClose: '2026-11-13', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Sameer Kulkarni', 'Sanjay Patel'],
        expansion: {project: 'Enrolment Portal'},
        detail: {
          scope: 'Scale the enrolment portal for 25% higher open enrolment volumes.',
          decisionMakers: ['Rachel Gomez'],
          whyWeWin: 'We built the portal; deadline is open enrolment.',
          risks: ['Low risk'],
          nextSteps: [
            {step: 'Load test plan', owner: 'Sanjay Patel', due: '2026-10-20'},
            {step: 'Price', owner: 'Sameer Kulkarni', due: '2026-10-30'},
            {step: 'Sign', owner: 'Sameer Kulkarni', due: '2026-11-12'},
          ],
          products: [{name: 'BlueSwan', why: 'Performance testing before open enrolment.'}],
        },
      },
      {
        id: 'cp-renewal', name: 'Cloud hosting renewal', type: 'Renewal', serviceLine: 'Cloud & Infra', status: 'Active', stage: 'Proposal',
        annualValue: 310, tcv: 620, winPct: 75, expectedClose: '2027-01-22', plannedMarginPct: 27, competitors: ['LTIMindtree'], dealTeam: ['Sameer Kulkarni', 'Sanjay Patel'],
        renewal: {currentAnnualValue: 300, contractEnd: '2027-02-28', status: 'Proposal submitted'},
        detail: {
          scope: 'Two-year cloud hosting renewal.',
          decisionMakers: ['Rachel Gomez'],
          whyWeWin: 'Reliable through peak enrolment.',
          risks: ['LTIMindtree offering hosting with reporting'],
          nextSteps: [
            {step: 'Peak season review', owner: 'Sanjay Patel', due: '2026-11-24'},
            {step: 'Agree terms', owner: 'Sameer Kulkarni', due: '2026-12-15'},
            {step: 'Sign', owner: 'Sameer Kulkarni', due: '2027-01-20'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Automated scaling for peak periods.'}],
        },
      },
      {
        id: 'cp-claims', name: 'Claims analytics', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Potential',
        annualValue: 300, tcv: 900, expectedClose: '2027-05-31', plannedMarginPct: 31, competitors: ['LTIMindtree'], dealTeam: ['Sameer Kulkarni'],
        detail: {
          scope: 'Claims cost and trend analytics for employer clients.',
          decisionMakers: ['Ian Murphy'],
          whyWeWin: 'We hold the claims data.',
          risks: ['COO already talking to LTIMindtree'],
          nextSteps: [
            {step: 'Meet COO', owner: 'Sameer Kulkarni', due: '2026-10-26'},
            {step: 'Demo payer analytics', owner: 'Sameer Kulkarni', due: '2026-11-16'},
            {step: 'Qualify', owner: 'Sameer Kulkarni', due: '2026-12-14'},
          ],
          products: [{name: 'Data Cosmos', why: 'Benefits analytics templates.'}],
        },
      },
      {
        id: 'cp-won-hr', name: 'HR integration APIs', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Won',
        annualValue: 150, tcv: 300, expectedClose: '2026-09-04', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Sameer Kulkarni'],
        expansion: {project: 'Enrolment Portal'},
      },
      {
        id: 'cp-lost-dw', name: 'Benefits data warehouse', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 200, tcv: 400, expectedClose: '2025-12-17', plannedMarginPct: 30, competitors: ['LTIMindtree'], dealTeam: ['Sameer Kulkarni'],
      },
    ],
  },
  // ---------------------------------------------------------------- Healthcare · Providers
  {
    id: 'st-aria-medical-center',
    fy26Revenue: 2500, fy26YtdRevenue: 1120, fy27YtdRevenue: 1370, securedFy27Revenue: 2560, itSpend: 12000, fy26YtdWonValue: 300,
    serviceLines: SL([2500, true], [3000, false], [2500, true], [3000, false], [1000, true]),
    competitorSpend: {Accenture: 2200, Infosys: 1000},
    contracts: [
      {id: 'sm-c1', competitor: 'Accenture', serviceLine: 'Enterprise Apps', scope: 'Electronic health record support', annualValue: 2200, endDate: '2027-09-30', satisfaction: 'Medium'},
      {id: 'sm-c2', competitor: 'Infosys', serviceLine: 'Data & AI', scope: 'Data warehouse', annualValue: 1000, endDate: '2028-12-31', satisfaction: 'Low'},
    ],
    divisions: [],
    stakeholders: [
      {name: 'Dr. Ellen Park', role: 'Chief Digital & Information Officer', strength: 'Medium'},
      {name: 'Mark Jensen', role: 'CFO', strength: 'Weak'},
      {name: 'Dr. Samuel Ortiz', role: 'Chief Medical Officer', strength: 'Medium'},
    ],
    signals: [
      {tone: 'positive', text: 'Health system plans a clinical data & AI platform in FY28'},
      {tone: 'watch', text: 'Accenture EHR support contract ends Sep 2027'},
      {tone: 'risk', text: 'CFO freezing new spend until Q4 results'},
    ],
    noOpportunity: {'New division/region': 'All hospitals in the system already served'},
    opportunities: [
      {
        id: 'sm-telehealth', name: 'Patient app – telehealth module', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 400, tcv: 800, winPct: 70, expectedClose: '2026-11-20', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Lauren Hayes', 'Rachel Adams'],
        expansion: {project: 'Patient App'},
        detail: {
          scope: 'Video visits and e-prescriptions in the patient app.',
          decisionMakers: ['Dr. Ellen Park'],
          whyWeWin: 'We built the patient app; clinicians support it.',
          risks: ['CFO spending freeze'],
          nextSteps: [
            {step: 'Clinical workflow sign-off', owner: 'Rachel Adams', due: '2026-10-22'},
            {step: 'Price', owner: 'Lauren Hayes', due: '2026-11-05'},
            {step: 'Sign', owner: 'Lauren Hayes', due: '2026-11-19'},
          ],
          products: [{name: 'Forge-X', why: 'Fast module build on the existing app.'}],
        },
      },
      {
        id: 'sm-renewal', name: 'Cloud infrastructure renewal', type: 'Renewal', serviceLine: 'Cloud & Infra', status: 'Active', stage: 'Negotiation',
        annualValue: 720, tcv: 1440, winPct: 85, expectedClose: '2026-11-27', plannedMarginPct: 27, competitors: ['Infosys'], dealTeam: ['Lauren Hayes', 'Rachel Adams'],
        renewal: {currentAnnualValue: 700, contractEnd: '2026-12-31', status: 'Under negotiation'},
        detail: {
          scope: 'Two-year cloud infrastructure renewal with 3% uplift.',
          decisionMakers: ['Dr. Ellen Park', 'Mark Jensen'],
          whyWeWin: 'No downtime on clinical systems in two years.',
          risks: ['CFO may ask for a flat price'],
          nextSteps: [
            {step: 'Service review', owner: 'Rachel Adams', due: '2026-10-21'},
            {step: 'Agree terms', owner: 'Lauren Hayes', due: '2026-11-11'},
            {step: 'Sign', owner: 'Lauren Hayes', due: '2026-11-25'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Agentic operations for clinical uptime.'}],
        },
      },
      {
        id: 'sm-clinicaldata', name: 'Clinical data & AI platform', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Potential',
        annualValue: 2400, tcv: 12000, expectedClose: '2027-06-30', plannedMarginPct: 31, competitors: ['Accenture', 'Infosys'], dealTeam: ['Lauren Hayes', 'Megan Ortiz'],
        detail: {
          scope: 'Five-year clinical data platform with sepsis and readmission AI models.',
          decisionMakers: ['Dr. Ellen Park', 'Dr. Samuel Ortiz'],
          whyWeWin: 'Clinical leaders unhappy with the Infosys warehouse; we know their app and cloud estate.',
          risks: ['Not funded until FY28', 'Accenture positioning through EHR'],
          nextSteps: [
            {step: 'Clinical AI workshop with the CMO', owner: 'Megan Ortiz', due: '2026-10-29'},
            {step: 'Business case for FY28 budget', owner: 'Lauren Hayes', due: '2026-12-03'},
            {step: 'Qualify into Active pipeline', owner: 'Lauren Hayes', due: '2026-12-15'},
          ],
          products: [{name: 'Data Cosmos', why: 'Clinical data model and pipelines.'}, {name: 'Coforge Quasar', why: 'Runs clinical AI models.'}],
        },
      },
      {
        id: 'sm-ehr', name: 'EHR support takeover from Accenture', type: 'Competitor takeover', serviceLine: 'Enterprise Apps', status: 'Potential',
        annualValue: 1800, tcv: 5400, expectedClose: '2027-07-31', plannedMarginPct: 29, competitors: ['Accenture'], dealTeam: ['Lauren Hayes'],
        takeover: {contractId: 'sm-c1'},
        detail: {
          scope: 'Three-year EHR support from October 2027.',
          decisionMakers: ['Dr. Ellen Park'],
          whyWeWin: 'Lower cost and one partner for apps and cloud.',
          risks: ['Accenture well regarded by clinicians'],
          nextSteps: [
            {step: 'EHR support benchmark', owner: 'Lauren Hayes', due: '2026-11-17'},
            {step: 'Share provider references', owner: 'Lauren Hayes', due: '2026-12-08'},
            {step: 'Qualify', owner: 'Lauren Hayes', due: '2027-01-26'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Lower-cost EHR support.'}],
        },
      },
      {
        id: 'sm-won-rcm', name: 'Revenue cycle bots', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Won',
        annualValue: 300, tcv: 600, expectedClose: '2026-06-17', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Lauren Hayes'],
        expansion: {project: 'Revenue Cycle'},
      },
      {
        id: 'sm-lost-dw', name: 'Cloud data warehouse', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Lost',
        annualValue: 400, tcv: 800, expectedClose: '2026-02-26', plannedMarginPct: 30, competitors: ['Infosys'], dealTeam: ['Lauren Hayes'],
      },
    ],
  },
  {
    id: 'northwind-clinics',
    fy26Revenue: 1000, fy26YtdRevenue: 450, fy27YtdRevenue: 550, securedFy27Revenue: 960, itSpend: 5000, fy26YtdWonValue: 150,
    serviceLines: SL([1200, true], [1200, false], [1000, true], [1100, true], [500, true]),
    competitorSpend: {Cognizant: 500},
    contracts: [
      {id: 'nw-c1', competitor: 'Cognizant', serviceLine: 'Data & AI', scope: 'Clinic reporting', annualValue: 500, endDate: '2029-03-31', satisfaction: 'Medium'},
    ],
    divisions: [{name: 'Northwest region clinics', spend: 800, sponsorIdentified: true}],
    stakeholders: [
      {name: 'Dr. Laura Chen', role: 'CEO', strength: 'Medium'},
      {name: 'Victor Ramos', role: 'IT Director', strength: 'Strong'},
    ],
    signals: [
      {tone: 'positive', text: 'Opening 12 clinics in the Northwest region in 2027'},
      {tone: 'watch', text: 'Population health analytics on the FY28 wish list'},
    ],
    noOpportunity: {'Competitor takeover': 'No competitor contract expiring in 18 months'},
    opportunities: [
      {
        id: 'nw-scheduling', name: 'Clinic scheduling – new clinics', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Active', stage: 'Negotiation',
        annualValue: 300, tcv: 600, winPct: 65, expectedClose: '2026-10-23', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Abhishek Jain', 'Rachel Adams'],
        expansion: {project: 'Clinic Scheduling'},
        detail: {
          scope: 'Roll out scheduling to 15 more existing clinics.',
          decisionMakers: ['Victor Ramos'],
          whyWeWin: 'Scheduling cut no-shows by 11%.',
          risks: ['Low risk'],
          nextSteps: [
            {step: 'Rollout plan', owner: 'Rachel Adams', due: '2026-10-13'},
            {step: 'Price', owner: 'Abhishek Jain', due: '2026-10-16'},
            {step: 'Sign', owner: 'Abhishek Jain', due: '2026-10-22'},
          ],
          products: [{name: 'Forge-X', why: 'Fast clinic onboarding.'}],
        },
      },
      {
        id: 'nw-renewal', name: 'EHR integration support renewal', type: 'Renewal', serviceLine: 'Enterprise Apps', status: 'Active', stage: 'Negotiation',
        annualValue: 260, tcv: 520, winPct: 90, expectedClose: '2026-10-30', plannedMarginPct: 30, competitors: ['In-house'], dealTeam: ['Abhishek Jain', 'Rachel Adams'],
        renewal: {currentAnnualValue: 250, contractEnd: '2026-11-30', status: 'Under negotiation'},
        detail: {
          scope: 'Two-year EHR integration support renewal.',
          decisionMakers: ['Victor Ramos'],
          whyWeWin: 'Small IT team relies on us.',
          risks: ['Low risk'],
          nextSteps: [
            {step: 'Agree service levels', owner: 'Rachel Adams', due: '2026-10-14'},
            {step: 'Price', owner: 'Abhishek Jain', due: '2026-10-21'},
            {step: 'Sign', owner: 'Abhishek Jain', due: '2026-10-29'},
          ],
          products: [{name: 'EvolveOps.AI', why: 'Automated integration monitoring.'}],
        },
      },
      {
        id: 'nw-pophealth', name: 'Population health analytics', type: 'Cross-sell', serviceLine: 'Data & AI', status: 'Potential',
        annualValue: 500, tcv: 1500, expectedClose: '2027-05-31', plannedMarginPct: 31, competitors: ['Cognizant'], dealTeam: ['Abhishek Jain'],
        detail: {
          scope: 'Population health dashboards and care-gap alerts.',
          decisionMakers: ['Dr. Laura Chen'],
          whyWeWin: 'We hold the scheduling and EHR integration data.',
          risks: ['FY28 budget'],
          nextSteps: [
            {step: 'Care-gap demo for the CEO', owner: 'Abhishek Jain', due: '2026-11-09'},
            {step: 'Business case', owner: 'Abhishek Jain', due: '2026-12-07'},
            {step: 'Qualify', owner: 'Abhishek Jain', due: '2027-01-25'},
          ],
          products: [{name: 'Data Cosmos', why: 'Population health data model.'}],
        },
      },
      {
        id: 'nw-region', name: 'Northwest region clinic systems', type: 'New division/region', serviceLine: 'Digital Engineering', status: 'Potential',
        annualValue: 300, tcv: 900, expectedClose: '2027-03-31', plannedMarginPct: 31, competitors: ['In-house'], dealTeam: ['Abhishek Jain'],
        newDivision: {division: 'Northwest region clinics'},
        detail: {
          scope: 'Scheduling, patient app and integration for the 12 new Northwest clinics.',
          decisionMakers: ['Dr. Laura Chen', 'Victor Ramos'],
          whyWeWin: 'Same platform as existing clinics.',
          risks: ['Clinic openings could slip'],
          nextSteps: [
            {step: 'Confirm opening dates', owner: 'Abhishek Jain', due: '2026-10-27'},
            {step: 'Rollout proposal', owner: 'Abhishek Jain', due: '2026-12-01'},
            {step: 'Qualify', owner: 'Abhishek Jain', due: '2027-01-12'},
          ],
          products: [{name: 'Forge-X', why: 'Template rollout for new clinics.'}],
        },
      },
      {
        id: 'nw-won-kiosk', name: 'Patient intake kiosk', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Won',
        annualValue: 200, tcv: 400, expectedClose: '2026-08-12', plannedMarginPct: 32, competitors: ['In-house'], dealTeam: ['Abhishek Jain'],
        expansion: {project: 'Clinic Scheduling'},
      },
      {
        id: 'nw-lost-portal', name: 'Referral portal', type: 'Expansion', serviceLine: 'Digital Engineering', status: 'Lost',
        annualValue: 150, tcv: 300, expectedClose: '2026-03-11', plannedMarginPct: 31, competitors: ['Cognizant'], dealTeam: ['Abhishek Jain'],
        expansion: {project: 'Referral Portal'},
      },
    ],
  },
];

// <snapshots>
/** Quarter-end inputs for Q4 FY26 and Q1 FY27, by account id. Q2 FY27 is computed from the opportunities. */
export const SNAPSHOTS: Readonly<Record<string, readonly [GrowthSnapshot, GrowthSnapshot]>> = {
  'northbridge-bank': [
    {ytdRevenue: 5000, priorYtdRevenue: 4620, ttmRevenue: 5000, itSpend: 11640, securedFy27: 4000, pipelineIfWon: 3070, expectedFy27: 1630, largeDealCount: 1, largeDealTcv: 10800, wonYtd: 2730, priorWonYtd: 2530, wonTtm: 810, lostTtm: 1470, renewalsAtRisk: 790},
    {ytdRevenue: 1250, priorYtdRevenue: 1180, ttmRevenue: 5070, itSpend: 11820, securedFy27: 4320, pipelineIfWon: 2250, expectedFy27: 1260, largeDealCount: 1, largeDealTcv: 10800, wonYtd: 0, priorWonYtd: 590, wonTtm: 860, lostTtm: 1400, renewalsAtRisk: 760},
  ],
  'harbor-savings': [
    {ytdRevenue: 3000, priorYtdRevenue: 2760, ttmRevenue: 3000, itSpend: 7280, securedFy27: 2490, pipelineIfWon: 2660, expectedFy27: 730, largeDealCount: 0, largeDealTcv: 0, wonYtd: 1470, priorWonYtd: 1360, wonTtm: 720, lostTtm: 1050, renewalsAtRisk: 210},
    {ytdRevenue: 750, priorYtdRevenue: 710, ttmRevenue: 3040, itSpend: 7390, securedFy27: 2700, pipelineIfWon: 1690, expectedFy27: 490, largeDealCount: 0, largeDealTcv: 0, wonYtd: 800, priorWonYtd: 320, wonTtm: 760, lostTtm: 1000, renewalsAtRisk: 200},
  ],
  'crestline-credit-union': [
    {ytdRevenue: 2000, priorYtdRevenue: 1810, ttmRevenue: 2000, itSpend: 4460, securedFy27: 1660, pipelineIfWon: 1330, expectedFy27: 520, largeDealCount: 0, largeDealTcv: 0, wonYtd: 1050, priorWonYtd: 970, wonTtm: 540, lostTtm: 740, renewalsAtRisk: 140},
    {ytdRevenue: 510, priorYtdRevenue: 470, ttmRevenue: 2040, itSpend: 4530, securedFy27: 1790, pipelineIfWon: 900, expectedFy27: 370, largeDealCount: 0, largeDealTcv: 0, wonYtd: 600, priorWonYtd: 230, wonTtm: 570, lostTtm: 700, renewalsAtRisk: 140},
  ],
  'sterling-commercial-bank': [
    {ytdRevenue: 7000, priorYtdRevenue: 6560, ttmRevenue: 7000, itSpend: 17460, securedFy27: 5720, pipelineIfWon: 5910, expectedFy27: 2030, largeDealCount: 0, largeDealTcv: 0, wonYtd: 3150, priorWonYtd: 2920, wonTtm: 1080, lostTtm: 1580, renewalsAtRisk: 350},
    {ytdRevenue: 1740, priorYtdRevenue: 1670, ttmRevenue: 7070, itSpend: 17730, securedFy27: 6180, pipelineIfWon: 4160, expectedFy27: 1510, largeDealCount: 1, largeDealTcv: 14000, wonYtd: 1200, priorWonYtd: 680, wonTtm: 1140, lostTtm: 1500, renewalsAtRisk: 330},
  ],
  'atlas-trade-finance': [
    {ytdRevenue: 2000, priorYtdRevenue: 1830, ttmRevenue: 2000, itSpend: 4850, securedFy27: 1610, pipelineIfWon: 1230, expectedFy27: 620, largeDealCount: 0, largeDealTcv: 0, wonYtd: 840, priorWonYtd: 780, wonTtm: 450, lostTtm: 420, renewalsAtRisk: 190},
    {ytdRevenue: 510, priorYtdRevenue: 480, ttmRevenue: 2030, itSpend: 4930, securedFy27: 1740, pipelineIfWon: 900, expectedFy27: 480, largeDealCount: 0, largeDealTcv: 0, wonYtd: 0, priorWonYtd: 180, wonTtm: 480, lostTtm: 400, renewalsAtRisk: 180},
  ],
  'evergreen-life': [
    {ytdRevenue: 5000, priorYtdRevenue: 4490, ttmRevenue: 5000, itSpend: 15520, securedFy27: 4010, pipelineIfWon: 2940, expectedFy27: 1520, largeDealCount: 1, largeDealTcv: 10800, wonYtd: 2310, priorWonYtd: 2140, wonTtm: 900, lostTtm: 840, renewalsAtRisk: 650},
    {ytdRevenue: 1320, priorYtdRevenue: 1190, ttmRevenue: 5130, itSpend: 15760, securedFy27: 4330, pipelineIfWon: 2240, expectedFy27: 1220, largeDealCount: 1, largeDealTcv: 10800, wonYtd: 0, priorWonYtd: 500, wonTtm: 950, lostTtm: 800, renewalsAtRisk: 860},
  ],
  'summit-annuity': [
    {ytdRevenue: 2500, priorYtdRevenue: 2260, ttmRevenue: 2500, itSpend: 8730, securedFy27: 2110, pipelineIfWon: 1360, expectedFy27: 710, largeDealCount: 0, largeDealTcv: 0, wonYtd: 1050, priorWonYtd: 970, wonTtm: 540, lostTtm: 950, renewalsAtRisk: 60},
    {ytdRevenue: 650, priorYtdRevenue: 590, ttmRevenue: 2560, itSpend: 8870, securedFy27: 2280, pipelineIfWon: 1000, expectedFy27: 550, largeDealCount: 0, largeDealTcv: 0, wonYtd: 600, priorWonYtd: 230, wonTtm: 570, lostTtm: 900, renewalsAtRisk: 80},
  ],
  'beacon-mutual': [
    {ytdRevenue: 1500, priorYtdRevenue: 1370, ttmRevenue: 1500, itSpend: 5820, securedFy27: 1330, pipelineIfWon: 800, expectedFy27: 330, largeDealCount: 0, largeDealTcv: 0, wonYtd: 630, priorWonYtd: 580, wonTtm: 450, lostTtm: 630, renewalsAtRisk: 0},
    {ytdRevenue: 390, priorYtdRevenue: 360, ttmRevenue: 1530, itSpend: 5910, securedFy27: 1440, pipelineIfWon: 500, expectedFy27: 220, largeDealCount: 0, largeDealTcv: 0, wonYtd: 0, priorWonYtd: 140, wonTtm: 480, lostTtm: 600, renewalsAtRisk: 0},
  ],
  'shield-property-insurance': [
    {ytdRevenue: 3000, priorYtdRevenue: 2740, ttmRevenue: 3000, itSpend: 10670, securedFy27: 2670, pipelineIfWon: 1820, expectedFy27: 710, largeDealCount: 1, largeDealTcv: 10000, wonYtd: 1260, priorWonYtd: 1170, wonTtm: 900, lostTtm: 1260, renewalsAtRisk: 190},
    {ytdRevenue: 780, priorYtdRevenue: 710, ttmRevenue: 3070, itSpend: 10840, securedFy27: 2880, pipelineIfWon: 1260, expectedFy27: 520, largeDealCount: 1, largeDealTcv: 10000, wonYtd: 1000, priorWonYtd: 270, wonTtm: 950, lostTtm: 1200, renewalsAtRisk: 250},
  ],
  'granite-casualty': [
    {ytdRevenue: 2000, priorYtdRevenue: 1810, ttmRevenue: 2000, itSpend: 7760, securedFy27: 1720, pipelineIfWon: 1150, expectedFy27: 630, largeDealCount: 0, largeDealTcv: 0, wonYtd: 840, priorWonYtd: 780, wonTtm: 720, lostTtm: 1050, renewalsAtRisk: 110},
    {ytdRevenue: 520, priorYtdRevenue: 470, ttmRevenue: 2050, itSpend: 7880, securedFy27: 1860, pipelineIfWon: 870, expectedFy27: 500, largeDealCount: 0, largeDealTcv: 0, wonYtd: 800, priorWonYtd: 180, wonTtm: 760, lostTtm: 1000, renewalsAtRisk: 140},
  ],
  'skybridge-airways': [
    {ytdRevenue: 4500, priorYtdRevenue: 3890, ttmRevenue: 4500, itSpend: 13580, securedFy27: 3940, pipelineIfWon: 3260, expectedFy27: 1360, largeDealCount: 1, largeDealTcv: 12000, wonYtd: 1890, priorWonYtd: 1750, wonTtm: 1620, lostTtm: 1260, renewalsAtRisk: 140},
    {ytdRevenue: 1230, priorYtdRevenue: 1050, ttmRevenue: 4680, itSpend: 13790, securedFy27: 4260, pipelineIfWon: 2430, expectedFy27: 1070, largeDealCount: 1, largeDealTcv: 12000, wonYtd: 0, priorWonYtd: 410, wonTtm: 1710, lostTtm: 1200, renewalsAtRisk: 130},
  ],
  'aurora-air': [
    {ytdRevenue: 2500, priorYtdRevenue: 2200, ttmRevenue: 2500, itSpend: 7760, securedFy27: 2240, pipelineIfWon: 1160, expectedFy27: 550, largeDealCount: 0, largeDealTcv: 0, wonYtd: 1050, priorWonYtd: 970, wonTtm: 540, lostTtm: 530, renewalsAtRisk: 0},
    {ytdRevenue: 680, priorYtdRevenue: 590, ttmRevenue: 2590, itSpend: 7880, securedFy27: 2420, pipelineIfWon: 780, expectedFy27: 390, largeDealCount: 0, largeDealTcv: 0, wonYtd: 600, priorWonYtd: 230, wonTtm: 570, lostTtm: 500, renewalsAtRisk: 0},
  ],
  'pacific-jetlines': [
    {ytdRevenue: 1500, priorYtdRevenue: 1370, ttmRevenue: 1500, itSpend: 6310, securedFy27: 1290, pipelineIfWon: 850, expectedFy27: 360, largeDealCount: 0, largeDealTcv: 0, wonYtd: 630, priorWonYtd: 580, wonTtm: 630, lostTtm: 530, renewalsAtRisk: 0},
    {ytdRevenue: 390, priorYtdRevenue: 350, ttmRevenue: 1540, itSpend: 6400, securedFy27: 1400, pipelineIfWon: 580, expectedFy27: 260, largeDealCount: 0, largeDealTcv: 0, wonYtd: 0, priorWonYtd: 140, wonTtm: 670, lostTtm: 500, renewalsAtRisk: 0},
  ],
  'grand-vista-hotels': [
    {ytdRevenue: 3000, priorYtdRevenue: 2620, ttmRevenue: 3000, itSpend: 9220, securedFy27: 2570, pipelineIfWon: 1970, expectedFy27: 970, largeDealCount: 0, largeDealTcv: 0, wonYtd: 1260, priorWonYtd: 1170, wonTtm: 720, lostTtm: 950, renewalsAtRisk: 100},
    {ytdRevenue: 810, priorYtdRevenue: 700, ttmRevenue: 3110, itSpend: 9360, securedFy27: 2780, pipelineIfWon: 1500, expectedFy27: 780, largeDealCount: 1, largeDealTcv: 10500, wonYtd: 800, priorWonYtd: 270, wonTtm: 760, lostTtm: 900, renewalsAtRisk: 100},
  ],
  'coastal-resorts': [
    {ytdRevenue: 1500, priorYtdRevenue: 1320, ttmRevenue: 1500, itSpend: 4850, securedFy27: 1250, pipelineIfWon: 810, expectedFy27: 390, largeDealCount: 0, largeDealTcv: 0, wonYtd: 630, priorWonYtd: 580, wonTtm: 540, lostTtm: 420, renewalsAtRisk: 0},
    {ytdRevenue: 410, priorYtdRevenue: 360, ttmRevenue: 1550, itSpend: 4930, securedFy27: 1350, pipelineIfWon: 610, expectedFy27: 310, largeDealCount: 0, largeDealTcv: 0, wonYtd: 600, priorWonYtd: 140, wonTtm: 570, lostTtm: 400, renewalsAtRisk: 0},
  ],
  'blueriver-health-plan': [
    {ytdRevenue: 3500, priorYtdRevenue: 2910, ttmRevenue: 3500, itSpend: 14550, securedFy27: 3010, pipelineIfWon: 1480, expectedFy27: 1120, largeDealCount: 1, largeDealTcv: 10000, wonYtd: 1050, priorWonYtd: 970, wonTtm: 900, lostTtm: 1160, renewalsAtRisk: 220},
    {ytdRevenue: 950, priorYtdRevenue: 780, ttmRevenue: 3670, itSpend: 14780, securedFy27: 3260, pipelineIfWon: 1060, expectedFy27: 850, largeDealCount: 1, largeDealTcv: 10000, wonYtd: 0, priorWonYtd: 230, wonTtm: 950, lostTtm: 1100, renewalsAtRisk: 210},
  ],
  'unity-health-insurance': [
    {ytdRevenue: 2000, priorYtdRevenue: 1660, ttmRevenue: 2000, itSpend: 8730, securedFy27: 1760, pipelineIfWon: 760, expectedFy27: 530, largeDealCount: 0, largeDealTcv: 0, wonYtd: 630, priorWonYtd: 580, wonTtm: 540, lostTtm: 740, renewalsAtRisk: 70},
    {ytdRevenue: 540, priorYtdRevenue: 450, ttmRevenue: 2090, itSpend: 8870, securedFy27: 1910, pipelineIfWon: 500, expectedFy27: 370, largeDealCount: 0, largeDealTcv: 0, wonYtd: 600, priorWonYtd: 140, wonTtm: 570, lostTtm: 700, renewalsAtRisk: 70},
  ],
  'clearpath-benefits': [
    {ytdRevenue: 1000, priorYtdRevenue: 850, ttmRevenue: 1000, itSpend: 4370, securedFy27: 900, pipelineIfWon: 360, expectedFy27: 230, largeDealCount: 0, largeDealTcv: 0, wonYtd: 320, priorWonYtd: 290, wonTtm: 270, lostTtm: 420, renewalsAtRisk: 90},
    {ytdRevenue: 260, priorYtdRevenue: 220, ttmRevenue: 1040, itSpend: 4430, securedFy27: 980, pipelineIfWon: 210, expectedFy27: 140, largeDealCount: 0, largeDealTcv: 0, wonYtd: 0, priorWonYtd: 70, wonTtm: 290, lostTtm: 400, renewalsAtRisk: 80},
  ],
  'st-aria-medical-center': [
    {ytdRevenue: 2500, priorYtdRevenue: 2080, ttmRevenue: 2500, itSpend: 11640, securedFy27: 2200, pipelineIfWon: 890, expectedFy27: 630, largeDealCount: 0, largeDealTcv: 0, wonYtd: 630, priorWonYtd: 580, wonTtm: 540, lostTtm: 840, renewalsAtRisk: 120},
    {ytdRevenue: 670, priorYtdRevenue: 550, ttmRevenue: 2620, itSpend: 11820, securedFy27: 2380, pipelineIfWon: 590, expectedFy27: 440, largeDealCount: 0, largeDealTcv: 0, wonYtd: 600, priorWonYtd: 140, wonTtm: 570, lostTtm: 800, renewalsAtRisk: 110},
  ],
  'northwind-clinics': [
    {ytdRevenue: 1000, priorYtdRevenue: 830, ttmRevenue: 1000, itSpend: 4850, securedFy27: 830, pipelineIfWon: 440, expectedFy27: 300, largeDealCount: 0, largeDealTcv: 0, wonYtd: 320, priorWonYtd: 290, wonTtm: 360, lostTtm: 320, renewalsAtRisk: 30},
    {ytdRevenue: 270, priorYtdRevenue: 220, ttmRevenue: 1050, itSpend: 4930, securedFy27: 890, pipelineIfWon: 340, expectedFy27: 240, largeDealCount: 0, largeDealTcv: 0, wonYtd: 0, priorWonYtd: 70, wonTtm: 380, lostTtm: 300, renewalsAtRisk: 30},
  ],
};
// </snapshots>
