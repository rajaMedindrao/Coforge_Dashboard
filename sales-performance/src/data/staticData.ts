/**
 * Static demo data for the CEO Quarterly Business Review.
 *
 * Only base values at the lowest level are stored here: accounts (sales) and projects (delivery).
 * Every BU, Sub-BU and company figure is computed from these in src/model.
 *
 * Units: money in USD thousands (always a multiple of 10, i.e. rounded to $10K);
 * percentages as numbers with one decimal (32.5 = 32.5%); CSAT out of 5 with one decimal.
 * Quarter arrays follow QUARTERS order: [Q4 FY26, Q1 FY27, Q2 FY27].
 */

export interface Quarter {
  id: 'Q4FY26' | 'Q1FY27' | 'Q2FY27';
  label: string;
  months: string;
}

export const QUARTERS: readonly [Quarter, Quarter, Quarter] = [
  { id: 'Q4FY26', label: 'Q4 FY26', months: 'Jan–Mar 2026' },
  { id: 'Q1FY27', label: 'Q1 FY27', months: 'Apr–Jun 2026' },
  { id: 'Q2FY27', label: 'Q2 FY27', months: 'Jul–Sep 2026' },
];

export const CURRENT_QUARTER = 2;

export type ByQuarter<T> = readonly [T, T, T];

export interface AccountQuarter {
  revenue: number;
  revenueTarget: number;
  deliveryCost: number;
  /** Gross margin target, % */
  marginTarget: number;
  bookings: number;
  bookingsTarget: number;
  /** Qualified pipeline value at quarter end */
  pipeline: number;
  nextQuarterBookingsTarget: number;
  wonValue: number;
  lostValue: number;
  newPipeline: number;
  newPipelineTarget: number;
  /** Revenue in the same quarter one year earlier */
  priorYearRevenue: number;
}

export type DealStage = 'Qualify' | 'Propose' | 'Negotiate' | 'Commit';

export interface Deal {
  name: string;
  value: number;
  stage: DealStage;
  /** ISO date */
  expectedClose: string;
}

export interface Account {
  id: string;
  name: string;
  clientPartner: string;
  quarters: ByQuarter<AccountQuarter>;
  openDeals: readonly [Deal, Deal, Deal];
}

export interface ProjectQuarter {
  billableFte: number;
  totalFte: number;
  revenue: number;
  /** Share of the account's revenue target; project targets add up to the account target */
  revenueTarget: number;
  cost: number;
  /** Planned project gross margin, % */
  marginPlan: number;
  /** Client satisfaction, out of 5 */
  csat: number;
  milestonesDue: number;
  milestonesMet: number;
  openEscalations: number;
  /** Team attrition, trailing 12 months, % */
  attritionPct: number;
}

export type MilestoneStatus = 'On track' | 'At risk' | 'Late';

export interface Milestone {
  name: string;
  /** ISO date */
  due: string;
  status: MilestoneStatus;
}

export interface Project {
  id: string;
  name: string;
  accountId: string;
  deliveryManager: string;
  quarters: ByQuarter<ProjectQuarter>;
  nextMilestones: readonly [Milestone, Milestone, Milestone];
}

export interface SubBu {
  id: string;
  name: string;
  salesLead: string;
  deliveryLead: string;
  accounts: readonly Account[];
  projects: readonly Project[];
}

export interface Bu {
  id: string;
  name: string;
  buHead: string;
  deliveryHead: string;
  subBus: readonly SubBu[];
}

export const BUSINESS_UNITS: readonly Bu[] = [
  {
    id: 'banking', name: 'Banking', buHead: 'Arjun Mehta', deliveryHead: 'Vikram Rao',
    subBus: [
      {
        id: 'retail-banking', name: 'Retail Banking', salesLead: 'Neha Gupta', deliveryLead: 'Suresh Kumar',
        accounts: [
          {
            id: 'northbridge-bank', name: 'Northbridge Bank', clientPartner: 'Aditi Sharma',
            quarters: [
              { revenue: 3130, revenueTarget: 3070, deliveryCost: 2080, marginTarget: 32.0, bookings: 3500, bookingsTarget: 3400, pipeline: 12000, nextQuarterBookingsTarget: 3530, wonValue: 3500, lostValue: 4110, newPipeline: 3960, newPipelineTarget: 3740, priorYearRevenue: 2790 },
              { revenue: 3170, revenueTarget: 3150, deliveryCost: 2110, marginTarget: 32.0, bookings: 3710, bookingsTarget: 3530, pipeline: 12000, nextQuarterBookingsTarget: 3530, wonValue: 3710, lostValue: 4180, newPipeline: 4040, newPipelineTarget: 3880, priorYearRevenue: 2910 },
              { revenue: 3220, revenueTarget: 3150, deliveryCost: 2150, marginTarget: 32.0, bookings: 3780, bookingsTarget: 3530, pipeline: 12220, nextQuarterBookingsTarget: 3650, wonValue: 3780, lostValue: 4440, newPipeline: 4070, newPipelineTarget: 3880, priorYearRevenue: 3040 },
            ],
            openDeals: [
              { name: 'Cloud migration phase 2', value: 3180, stage: 'Propose', expectedClose: '2026-11-20' },
              { name: 'Managed services extension', value: 2080, stage: 'Negotiate', expectedClose: '2026-10-30' },
              { name: 'Data & AI pilot', value: 1220, stage: 'Qualify', expectedClose: '2026-12-15' },
            ],
          },
          {
            id: 'harbor-savings', name: 'Harbor Savings', clientPartner: 'Mark Thompson',
            quarters: [
              { revenue: 2190, revenueTarget: 2190, deliveryCost: 1470, marginTarget: 32.0, bookings: 2420, bookingsTarget: 2420, pipeline: 8120, nextQuarterBookingsTarget: 2510, wonValue: 2420, lostValue: 3210, newPipeline: 2690, newPipelineTarget: 2660, priorYearRevenue: 1980 },
              { revenue: 2220, revenueTarget: 2240, deliveryCost: 1490, marginTarget: 32.0, bookings: 2560, bookingsTarget: 2510, pipeline: 8120, nextQuarterBookingsTarget: 2510, wonValue: 2560, lostValue: 3260, newPipeline: 2730, newPipelineTarget: 2760, priorYearRevenue: 2070 },
              { revenue: 2250, revenueTarget: 2240, deliveryCost: 1510, marginTarget: 32.0, bookings: 2610, bookingsTarget: 2510, pipeline: 8280, nextQuarterBookingsTarget: 2600, wonValue: 2610, lostValue: 3460, newPipeline: 2760, newPipelineTarget: 2760, priorYearRevenue: 2150 },
            ],
            openDeals: [
              { name: 'Cloud migration phase 2', value: 2150, stage: 'Propose', expectedClose: '2026-12-05' },
              { name: 'Managed services extension', value: 1410, stage: 'Negotiate', expectedClose: '2026-11-13' },
              { name: 'Data & AI pilot', value: 830, stage: 'Qualify', expectedClose: '2026-12-18' },
            ],
          },
          {
            id: 'crestline-credit-union', name: 'Crestline Credit Union', clientPartner: 'Kavya Reddy',
            quarters: [
              { revenue: 1560, revenueTarget: 1570, deliveryCost: 1040, marginTarget: 32.0, bookings: 1810, bookingsTarget: 1740, pipeline: 5880, nextQuarterBookingsTarget: 1800, wonValue: 1810, lostValue: 2300, newPipeline: 2010, newPipelineTarget: 1910, priorYearRevenue: 1420 },
              { revenue: 1580, revenueTarget: 1610, deliveryCost: 1060, marginTarget: 32.0, bookings: 1910, bookingsTarget: 1800, pipeline: 5880, nextQuarterBookingsTarget: 1800, wonValue: 1910, lostValue: 2330, newPipeline: 2040, newPipelineTarget: 1980, priorYearRevenue: 1480 },
              { revenue: 1610, revenueTarget: 1610, deliveryCost: 1080, marginTarget: 32.0, bookings: 1940, bookingsTarget: 1800, pipeline: 6020, nextQuarterBookingsTarget: 1870, wonValue: 1940, lostValue: 2470, newPipeline: 2060, newPipelineTarget: 1980, priorYearRevenue: 1550 },
            ],
            openDeals: [
              { name: 'Cloud migration phase 2', value: 1570, stage: 'Propose', expectedClose: '2026-11-27' },
              { name: 'Managed services extension', value: 1020, stage: 'Negotiate', expectedClose: '2026-10-23' },
              { name: 'Data & AI pilot', value: 600, stage: 'Qualify', expectedClose: '2026-12-11' },
            ],
          },
        ],
        projects: [
          {
            id: 'digital-onboarding', name: 'Digital Onboarding', accountId: 'northbridge-bank', deliveryManager: 'Ravi Shankar',
            quarters: [
              { billableFte: 45, totalFte: 54, revenue: 1880, revenueTarget: 1840, cost: 1250, marginPlan: 32.0, csat: 4.4, milestonesDue: 10, milestonesMet: 9, openEscalations: 0, attritionPct: 8.9 },
              { billableFte: 45, totalFte: 53, revenue: 1900, revenueTarget: 1890, cost: 1260, marginPlan: 32.0, csat: 4.6, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 9.4 },
              { billableFte: 46, totalFte: 55, revenue: 1930, revenueTarget: 1890, cost: 1280, marginPlan: 32.0, csat: 4.5, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 9.2 },
            ],
            nextMilestones: [
              { name: 'Release go-live', due: '2026-10-16', status: 'On track' },
              { name: 'UAT sign-off', due: '2026-10-30', status: 'On track' },
              { name: 'Quarterly business review', due: '2026-11-13', status: 'On track' },
            ],
          },
          {
            id: 'core-banking-upgrade', name: 'Core Banking Upgrade', accountId: 'northbridge-bank', deliveryManager: 'Kelly Brown',
            quarters: [
              { billableFte: 30, totalFte: 37, revenue: 1250, revenueTarget: 1230, cost: 830, marginPlan: 32.0, csat: 4.3, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 10.8 },
              { billableFte: 30, totalFte: 36, revenue: 1270, revenueTarget: 1260, cost: 850, marginPlan: 32.0, csat: 4.5, milestonesDue: 13, milestonesMet: 13, openEscalations: 0, attritionPct: 11.3 },
              { billableFte: 31, totalFte: 38, revenue: 1290, revenueTarget: 1260, cost: 870, marginPlan: 32.0, csat: 4.4, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 11.1 },
            ],
            nextMilestones: [
              { name: 'Data migration wave', due: '2026-10-09', status: 'On track' },
              { name: 'Performance test complete', due: '2026-10-23', status: 'On track' },
              { name: 'Steering committee review', due: '2026-11-06', status: 'On track' },
            ],
          },
          {
            id: 'mobile-app-rebuild', name: 'Mobile App Rebuild', accountId: 'harbor-savings', deliveryManager: 'Siddharth Rao',
            quarters: [
              { billableFte: 52, totalFte: 63, revenue: 2190, revenueTarget: 2190, cost: 1470, marginPlan: 32.0, csat: 4.2, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 10.2 },
              { billableFte: 53, totalFte: 63, revenue: 2220, revenueTarget: 2240, cost: 1490, marginPlan: 32.0, csat: 4.4, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 10.7 },
              { billableFte: 54, totalFte: 65, revenue: 2250, revenueTarget: 2240, cost: 1510, marginPlan: 32.0, csat: 4.5, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 10.5 },
            ],
            nextMilestones: [
              { name: 'Sprint demo to client', due: '2026-10-14', status: 'On track' },
              { name: 'Security audit closed', due: '2026-10-28', status: 'At risk' },
              { name: 'Production cut-over', due: '2026-11-18', status: 'On track' },
            ],
          },
          {
            id: 'loan-origination', name: 'Loan Origination', accountId: 'crestline-credit-union', deliveryManager: 'Megan Clark',
            quarters: [
              { billableFte: 37, totalFte: 44, revenue: 1560, revenueTarget: 1570, cost: 1040, marginPlan: 32.0, csat: 4.4, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 11.3 },
              { billableFte: 38, totalFte: 44, revenue: 1580, revenueTarget: 1610, cost: 1060, marginPlan: 32.0, csat: 4.6, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 11.8 },
              { billableFte: 38, totalFte: 45, revenue: 1610, revenueTarget: 1610, cost: 1080, marginPlan: 32.0, csat: 4.5, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 11.6 },
            ],
            nextMilestones: [
              { name: 'Integration testing done', due: '2026-10-21', status: 'On track' },
              { name: 'Client sign-off on design', due: '2026-11-04', status: 'On track' },
              { name: 'Hypercare exit', due: '2026-11-25', status: 'On track' },
            ],
          },
        ],
      },
      {
        id: 'corporate-banking', name: 'Corporate Banking', salesLead: 'James Carter', deliveryLead: 'Emily Watson',
        accounts: [
          {
            id: 'sterling-commercial-bank', name: 'Sterling Commercial Bank', clientPartner: 'Nikhil Bansal',
            quarters: [
              { revenue: 3780, revenueTarget: 3760, deliveryCost: 2530, marginTarget: 32.0, bookings: 4200, bookingsTarget: 4160, pipeline: 14650, nextQuarterBookingsTarget: 4310, wonValue: 4200, lostValue: 5800, newPipeline: 4850, newPipelineTarget: 4580, priorYearRevenue: 3440 },
              { revenue: 3820, revenueTarget: 3850, deliveryCost: 2560, marginTarget: 32.0, bookings: 4440, bookingsTarget: 4310, pipeline: 14650, nextQuarterBookingsTarget: 4310, wonValue: 4440, lostValue: 5890, newPipeline: 4930, newPipelineTarget: 4740, priorYearRevenue: 3580 },
              { revenue: 3890, revenueTarget: 3850, deliveryCost: 2610, marginTarget: 32.0, bookings: 4530, bookingsTarget: 4310, pipeline: 14960, nextQuarterBookingsTarget: 4470, wonValue: 4530, lostValue: 6260, newPipeline: 4980, newPipelineTarget: 4740, priorYearRevenue: 3750 },
            ],
            openDeals: [
              { name: 'Cloud migration phase 2', value: 3890, stage: 'Propose', expectedClose: '2026-11-20' },
              { name: 'Managed services extension', value: 2540, stage: 'Negotiate', expectedClose: '2026-10-30' },
              { name: 'Data & AI pilot', value: 1500, stage: 'Qualify', expectedClose: '2026-12-15' },
            ],
          },
          {
            id: 'atlas-trade-finance', name: 'Atlas Trade Finance', clientPartner: 'Jessica Moore',
            quarters: [
              { revenue: 960, revenueTarget: 970, deliveryCost: 650, marginTarget: 32.0, bookings: 1120, bookingsTarget: 1070, pipeline: 3590, nextQuarterBookingsTarget: 1110, wonValue: 1120, lostValue: 1370, newPipeline: 1190, newPipelineTarget: 1180, priorYearRevenue: 890 },
              { revenue: 970, revenueTarget: 990, deliveryCost: 650, marginTarget: 32.0, bookings: 1190, bookingsTarget: 1110, pipeline: 3590, nextQuarterBookingsTarget: 1110, wonValue: 1190, lostValue: 1400, newPipeline: 1210, newPipelineTarget: 1220, priorYearRevenue: 920 },
              { revenue: 980, revenueTarget: 990, deliveryCost: 660, marginTarget: 32.0, bookings: 1210, bookingsTarget: 1110, pipeline: 3660, nextQuarterBookingsTarget: 1150, wonValue: 1210, lostValue: 1480, newPipeline: 1220, newPipelineTarget: 1220, priorYearRevenue: 960 },
            ],
            openDeals: [
              { name: 'Cloud migration phase 2', value: 950, stage: 'Propose', expectedClose: '2026-12-05' },
              { name: 'Managed services extension', value: 620, stage: 'Negotiate', expectedClose: '2026-11-13' },
              { name: 'Data & AI pilot', value: 370, stage: 'Qualify', expectedClose: '2026-12-18' },
            ],
          },
          {
            id: 'meridian-treasury', name: 'Meridian Treasury', clientPartner: 'Arun Pillai',
            quarters: [
              { revenue: 630, revenueTarget: 640, deliveryCost: 420, marginTarget: 32.0, bookings: 720, bookingsTarget: 710, pipeline: 2420, nextQuarterBookingsTarget: 740, wonValue: 720, lostValue: 920, newPipeline: 820, newPipelineTarget: 780, priorYearRevenue: 590 },
              { revenue: 640, revenueTarget: 660, deliveryCost: 430, marginTarget: 32.0, bookings: 770, bookingsTarget: 740, pipeline: 2420, nextQuarterBookingsTarget: 740, wonValue: 770, lostValue: 940, newPipeline: 830, newPipelineTarget: 810, priorYearRevenue: 610 },
              { revenue: 650, revenueTarget: 660, deliveryCost: 440, marginTarget: 32.0, bookings: 780, bookingsTarget: 740, pipeline: 2450, nextQuarterBookingsTarget: 760, wonValue: 780, lostValue: 990, newPipeline: 840, newPipelineTarget: 810, priorYearRevenue: 640 },
            ],
            openDeals: [
              { name: 'Cloud migration phase 2', value: 640, stage: 'Propose', expectedClose: '2026-11-27' },
              { name: 'Managed services extension', value: 420, stage: 'Negotiate', expectedClose: '2026-10-23' },
              { name: 'Data & AI pilot', value: 250, stage: 'Qualify', expectedClose: '2026-12-11' },
            ],
          },
        ],
        projects: [
          {
            id: 'trade-finance-platform', name: 'Trade Finance Platform', accountId: 'sterling-commercial-bank', deliveryManager: 'Ajay Nambiar',
            quarters: [
              { billableFte: 54, totalFte: 65, revenue: 2270, revenueTarget: 2260, cost: 1510, marginPlan: 32.0, csat: 4.4, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 8.9 },
              { billableFte: 55, totalFte: 65, revenue: 2290, revenueTarget: 2310, cost: 1530, marginPlan: 32.0, csat: 4.2, milestonesDue: 12, milestonesMet: 11, openEscalations: 0, attritionPct: 9.4 },
              { billableFte: 55, totalFte: 65, revenue: 2330, revenueTarget: 2310, cost: 1560, marginPlan: 32.0, csat: 3.9, milestonesDue: 14, milestonesMet: 12, openEscalations: 1, attritionPct: 9.2 },
            ],
            nextMilestones: [
              { name: 'Release 4 go-live', due: '2026-10-14', status: 'At risk' },
              { name: 'Client steering committee', due: '2026-10-28', status: 'On track' },
              { name: 'Settlement module UAT', due: '2026-11-18', status: 'At risk' },
            ],
          },
          {
            id: 'treasury-data-hub', name: 'Treasury Data Hub', accountId: 'sterling-commercial-bank', deliveryManager: 'Rachel Green',
            quarters: [
              { billableFte: 36, totalFte: 44, revenue: 1510, revenueTarget: 1500, cost: 1020, marginPlan: 32.0, csat: 4.3, milestonesDue: 12, milestonesMet: 12, openEscalations: 1, attritionPct: 10.8 },
              { billableFte: 36, totalFte: 46, revenue: 1530, revenueTarget: 1540, cost: 1030, marginPlan: 32.0, csat: 4.5, milestonesDue: 13, milestonesMet: 13, openEscalations: 1, attritionPct: 11.3 },
              { billableFte: 37, totalFte: 48, revenue: 1560, revenueTarget: 1540, cost: 1050, marginPlan: 32.0, csat: 4.4, milestonesDue: 12, milestonesMet: 12, openEscalations: 1, attritionPct: 11.1 },
            ],
            nextMilestones: [
              { name: 'Data migration wave', due: '2026-10-09', status: 'On track' },
              { name: 'Performance test complete', due: '2026-10-23', status: 'On track' },
              { name: 'Steering committee review', due: '2026-11-06', status: 'On track' },
            ],
          },
          {
            id: 'payments-gateway', name: 'Payments Gateway', accountId: 'atlas-trade-finance', deliveryManager: 'Vivek Sinha',
            quarters: [
              { billableFte: 23, totalFte: 28, revenue: 960, revenueTarget: 970, cost: 650, marginPlan: 32.0, csat: 4.2, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 10.2 },
              { billableFte: 23, totalFte: 27, revenue: 970, revenueTarget: 990, cost: 650, marginPlan: 32.0, csat: 4.4, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 10.7 },
              { billableFte: 23, totalFte: 28, revenue: 980, revenueTarget: 990, cost: 660, marginPlan: 32.0, csat: 4.3, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 10.5 },
            ],
            nextMilestones: [
              { name: 'Sprint demo to client', due: '2026-10-14', status: 'On track' },
              { name: 'Security audit closed', due: '2026-10-28', status: 'On track' },
              { name: 'Production cut-over', due: '2026-11-18', status: 'On track' },
            ],
          },
          {
            id: 'cash-management-portal', name: 'Cash Management Portal', accountId: 'meridian-treasury', deliveryManager: 'Alicia Torres',
            quarters: [
              { billableFte: 15, totalFte: 18, revenue: 630, revenueTarget: 640, cost: 420, marginPlan: 32.0, csat: 4.4, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 13.7 },
              { billableFte: 15, totalFte: 17, revenue: 640, revenueTarget: 660, cost: 430, marginPlan: 32.0, csat: 4.6, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 14.2 },
              { billableFte: 15, totalFte: 18, revenue: 650, revenueTarget: 660, cost: 440, marginPlan: 32.0, csat: 4.5, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 14.0 },
            ],
            nextMilestones: [
              { name: 'Integration testing done', due: '2026-10-21', status: 'On track' },
              { name: 'Client sign-off on design', due: '2026-11-04', status: 'At risk' },
              { name: 'Hypercare exit', due: '2026-11-25', status: 'On track' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'insurance', name: 'Insurance', buHead: 'Claire Donovan', deliveryHead: 'Meera Iyer',
    subBus: [
      {
        id: 'life-annuities', name: 'Life & Annuities', salesLead: 'Priya Nair', deliveryLead: 'Rohan Joshi',
        accounts: [
          {
            id: 'evergreen-life', name: 'Evergreen Life', clientPartner: 'Sophie Turner',
            quarters: [
              { revenue: 2030, revenueTarget: 2000, deliveryCost: 1270, marginTarget: 36.0, bookings: 2530, bookingsTarget: 2480, pipeline: 8800, nextQuarterBookingsTarget: 2590, wonValue: 2530, lostValue: 3220, newPipeline: 2780, newPipelineTarget: 2730, priorYearRevenue: 1860 },
              { revenue: 2060, revenueTarget: 2050, deliveryCost: 1290, marginTarget: 36.0, bookings: 2540, bookingsTarget: 2590, pipeline: 14070, nextQuarterBookingsTarget: 4270, wonValue: 2540, lostValue: 3370, newPipeline: 2940, newPipelineTarget: 2850, priorYearRevenue: 1890 },
              { revenue: 2100, revenueTarget: 2050, deliveryCost: 1310, marginTarget: 36.0, bookings: 850, bookingsTarget: 4270, pipeline: 9260, nextQuarterBookingsTarget: 2810, wonValue: 850, lostValue: 1130, newPipeline: 4750, newPipelineTarget: 4700, priorYearRevenue: 1920 },
            ],
            openDeals: [
              { name: 'Policy admin renewal (3 years)', value: 3600, stage: 'Negotiate', expectedClose: '2026-10-30' },
              { name: 'Testing centre of excellence', value: 1570, stage: 'Negotiate', expectedClose: '2026-10-30' },
              { name: 'Customer portal refresh', value: 930, stage: 'Qualify', expectedClose: '2026-12-15' },
            ],
          },
          {
            id: 'summit-annuity', name: 'Summit Annuity', clientPartner: 'Varun Khanna',
            quarters: [
              { revenue: 1420, revenueTarget: 1420, deliveryCost: 890, marginTarget: 36.0, bookings: 1740, bookingsTarget: 1760, pipeline: 5950, nextQuarterBookingsTarget: 1840, wonValue: 1740, lostValue: 2500, newPipeline: 1880, newPipelineTarget: 1940, priorYearRevenue: 1320 },
              { revenue: 1440, revenueTarget: 1460, deliveryCost: 900, marginTarget: 36.0, bookings: 1750, bookingsTarget: 1840, pipeline: 5020, nextQuarterBookingsTarget: 1600, wonValue: 1750, lostValue: 2630, newPipeline: 1980, newPipelineTarget: 2020, priorYearRevenue: 1340 },
              { revenue: 1470, revenueTarget: 1460, deliveryCost: 920, marginTarget: 36.0, bookings: 1620, bookingsTarget: 1600, pipeline: 6270, nextQuarterBookingsTarget: 2000, wonValue: 1620, lostValue: 2430, newPipeline: 1690, newPipelineTarget: 1760, priorYearRevenue: 1360 },
            ],
            openDeals: [
              { name: 'Claims automation wave 2', value: 1630, stage: 'Propose', expectedClose: '2026-12-05' },
              { name: 'Testing centre of excellence', value: 1070, stage: 'Negotiate', expectedClose: '2026-11-13' },
              { name: 'Customer portal refresh', value: 630, stage: 'Qualify', expectedClose: '2026-12-18' },
            ],
          },
          {
            id: 'beacon-mutual', name: 'Beacon Mutual', clientPartner: 'Ishita Bose',
            quarters: [
              { revenue: 1020, revenueTarget: 1030, deliveryCost: 640, marginTarget: 36.0, bookings: 1310, bookingsTarget: 1270, pipeline: 4310, nextQuarterBookingsTarget: 1320, wonValue: 1310, lostValue: 1810, newPipeline: 1410, newPipelineTarget: 1400, priorYearRevenue: 960 },
              { revenue: 1020, revenueTarget: 1040, deliveryCost: 640, marginTarget: 36.0, bookings: 1310, bookingsTarget: 1320, pipeline: 3640, nextQuarterBookingsTarget: 1150, wonValue: 1310, lostValue: 1890, newPipeline: 1480, newPipelineTarget: 1450, priorYearRevenue: 960 },
              { revenue: 1050, revenueTarget: 1040, deliveryCost: 660, marginTarget: 36.0, bookings: 1210, bookingsTarget: 1150, pipeline: 4560, nextQuarterBookingsTarget: 1440, wonValue: 1210, lostValue: 1740, newPipeline: 1270, newPipelineTarget: 1270, priorYearRevenue: 980 },
            ],
            openDeals: [
              { name: 'Claims automation wave 2', value: 1190, stage: 'Propose', expectedClose: '2026-11-27' },
              { name: 'Testing centre of excellence', value: 780, stage: 'Negotiate', expectedClose: '2026-10-23' },
              { name: 'Customer portal refresh', value: 460, stage: 'Qualify', expectedClose: '2026-12-11' },
            ],
          },
        ],
        projects: [
          {
            id: 'policy-admin-modernisation', name: 'Policy Admin Modernisation', accountId: 'evergreen-life', deliveryManager: 'Gaurav Mishra',
            quarters: [
              { billableFte: 29, totalFte: 35, revenue: 1220, revenueTarget: 1200, cost: 760, marginPlan: 36.0, csat: 4.6, milestonesDue: 10, milestonesMet: 9, openEscalations: 0, attritionPct: 8.9 },
              { billableFte: 30, totalFte: 35, revenue: 1240, revenueTarget: 1230, cost: 770, marginPlan: 36.0, csat: 4.7, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 9.4 },
              { billableFte: 30, totalFte: 35, revenue: 1260, revenueTarget: 1230, cost: 780, marginPlan: 36.0, csat: 4.6, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 9.2 },
            ],
            nextMilestones: [
              { name: 'Release go-live', due: '2026-10-16', status: 'On track' },
              { name: 'UAT sign-off', due: '2026-10-30', status: 'On track' },
              { name: 'Quarterly business review', due: '2026-11-13', status: 'On track' },
            ],
          },
          {
            id: 'annuity-claims-automation', name: 'Annuity Claims Automation', accountId: 'evergreen-life', deliveryManager: 'Nina Patel',
            quarters: [
              { billableFte: 19, totalFte: 23, revenue: 810, revenueTarget: 800, cost: 510, marginPlan: 36.0, csat: 4.5, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 10.8 },
              { billableFte: 20, totalFte: 24, revenue: 820, revenueTarget: 820, cost: 520, marginPlan: 36.0, csat: 4.6, milestonesDue: 13, milestonesMet: 13, openEscalations: 0, attritionPct: 11.3 },
              { billableFte: 20, totalFte: 24, revenue: 840, revenueTarget: 820, cost: 530, marginPlan: 36.0, csat: 4.5, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 11.1 },
            ],
            nextMilestones: [
              { name: 'Data migration wave', due: '2026-10-09', status: 'On track' },
              { name: 'Performance test complete', due: '2026-10-23', status: 'On track' },
              { name: 'Steering committee review', due: '2026-11-06', status: 'On track' },
            ],
          },
          {
            id: 'agent-portal', name: 'Agent Portal', accountId: 'summit-annuity', deliveryManager: 'Harish Iyer',
            quarters: [
              { billableFte: 34, totalFte: 40, revenue: 1420, revenueTarget: 1420, cost: 890, marginPlan: 36.0, csat: 4.4, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 10.2 },
              { billableFte: 34, totalFte: 41, revenue: 1440, revenueTarget: 1460, cost: 900, marginPlan: 36.0, csat: 4.5, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 10.7 },
              { billableFte: 35, totalFte: 44, revenue: 1470, revenueTarget: 1460, cost: 920, marginPlan: 36.0, csat: 4.4, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 10.5 },
            ],
            nextMilestones: [
              { name: 'Sprint demo to client', due: '2026-10-14', status: 'On track' },
              { name: 'Security audit closed', due: '2026-10-28', status: 'At risk' },
              { name: 'Production cut-over', due: '2026-11-18', status: 'On track' },
            ],
          },
          {
            id: 'actuarial-data-platform', name: 'Actuarial Data Platform', accountId: 'beacon-mutual', deliveryManager: 'Jennifer Wu',
            quarters: [
              { billableFte: 24, totalFte: 28, revenue: 1020, revenueTarget: 1030, cost: 640, marginPlan: 36.0, csat: 4.6, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 11.3 },
              { billableFte: 24, totalFte: 28, revenue: 1020, revenueTarget: 1040, cost: 640, marginPlan: 36.0, csat: 4.7, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 11.8 },
              { billableFte: 25, totalFte: 29, revenue: 1050, revenueTarget: 1040, cost: 660, marginPlan: 36.0, csat: 4.6, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 11.6 },
            ],
            nextMilestones: [
              { name: 'Integration testing done', due: '2026-10-21', status: 'On track' },
              { name: 'Client sign-off on design', due: '2026-11-04', status: 'On track' },
              { name: 'Hypercare exit', due: '2026-11-25', status: 'On track' },
            ],
          },
        ],
      },
      {
        id: 'property-casualty', name: 'Property & Casualty', salesLead: 'Tom Ellis', deliveryLead: 'Hannah Lee',
        accounts: [
          {
            id: 'shield-property-insurance', name: 'Shield Property Insurance', clientPartner: 'Ryan Mitchell',
            quarters: [
              { revenue: 2010, revenueTarget: 2000, deliveryCost: 1250, marginTarget: 36.0, bookings: 2480, bookingsTarget: 2480, pipeline: 8800, nextQuarterBookingsTarget: 2590, wonValue: 2480, lostValue: 3720, newPipeline: 2780, newPipelineTarget: 2730, priorYearRevenue: 1840 },
              { revenue: 2040, revenueTarget: 2050, deliveryCost: 1270, marginTarget: 36.0, bookings: 2490, bookingsTarget: 2590, pipeline: 7420, nextQuarterBookingsTarget: 2250, wonValue: 2490, lostValue: 3890, newPipeline: 2940, newPipelineTarget: 2850, priorYearRevenue: 1870 },
              { revenue: 2080, revenueTarget: 2050, deliveryCost: 1290, marginTarget: 36.0, bookings: 2300, bookingsTarget: 2250, pipeline: 9260, nextQuarterBookingsTarget: 2810, wonValue: 2300, lostValue: 3600, newPipeline: 2500, newPipelineTarget: 2480, priorYearRevenue: 1900 },
            ],
            openDeals: [
              { name: 'Claims automation wave 2', value: 2410, stage: 'Propose', expectedClose: '2026-11-20' },
              { name: 'Testing centre of excellence', value: 1570, stage: 'Negotiate', expectedClose: '2026-10-30' },
              { name: 'Customer portal refresh', value: 930, stage: 'Qualify', expectedClose: '2026-12-15' },
            ],
          },
          {
            id: 'granite-casualty', name: 'Granite Casualty', clientPartner: 'Pooja Agarwal',
            quarters: [
              { revenue: 1410, revenueTarget: 1420, deliveryCost: 880, marginTarget: 36.0, bookings: 1830, bookingsTarget: 1760, pipeline: 5950, nextQuarterBookingsTarget: 1840, wonValue: 1830, lostValue: 2430, newPipeline: 1880, newPipelineTarget: 1940, priorYearRevenue: 1310 },
              { revenue: 1420, revenueTarget: 1460, deliveryCost: 890, marginTarget: 36.0, bookings: 1840, bookingsTarget: 1840, pipeline: 5020, nextQuarterBookingsTarget: 1600, wonValue: 1840, lostValue: 2540, newPipeline: 1980, newPipelineTarget: 2020, priorYearRevenue: 1320 },
              { revenue: 1460, revenueTarget: 1460, deliveryCost: 910, marginTarget: 36.0, bookings: 1700, bookingsTarget: 1600, pipeline: 6270, nextQuarterBookingsTarget: 2000, wonValue: 1700, lostValue: 2350, newPipeline: 1690, newPipelineTarget: 1760, priorYearRevenue: 1350 },
            ],
            openDeals: [
              { name: 'Claims automation wave 2', value: 1630, stage: 'Propose', expectedClose: '2026-12-05' },
              { name: 'Testing centre of excellence', value: 1070, stage: 'Negotiate', expectedClose: '2026-11-13' },
              { name: 'Customer portal refresh', value: 630, stage: 'Qualify', expectedClose: '2026-12-18' },
            ],
          },
          {
            id: 'harborline-auto', name: 'Harborline Auto', clientPartner: 'David Kim',
            quarters: [
              { revenue: 1010, revenueTarget: 1030, deliveryCost: 630, marginTarget: 36.0, bookings: 1260, bookingsTarget: 1250, pipeline: 4310, nextQuarterBookingsTarget: 1320, wonValue: 1260, lostValue: 1740, newPipeline: 1390, newPipelineTarget: 1380, priorYearRevenue: 950 },
              { revenue: 1020, revenueTarget: 1040, deliveryCost: 640, marginTarget: 36.0, bookings: 1280, bookingsTarget: 1320, pipeline: 3580, nextQuarterBookingsTarget: 1130, wonValue: 1280, lostValue: 1840, newPipeline: 1480, newPipelineTarget: 1450, priorYearRevenue: 960 },
              { revenue: 1040, revenueTarget: 1040, deliveryCost: 650, marginTarget: 36.0, bookings: 1160, bookingsTarget: 1130, pipeline: 4560, nextQuarterBookingsTarget: 1440, wonValue: 1160, lostValue: 1670, newPipeline: 1240, newPipelineTarget: 1240, priorYearRevenue: 970 },
            ],
            openDeals: [
              { name: 'Claims automation wave 2', value: 1190, stage: 'Propose', expectedClose: '2026-11-27' },
              { name: 'Testing centre of excellence', value: 780, stage: 'Negotiate', expectedClose: '2026-10-23' },
              { name: 'Customer portal refresh', value: 460, stage: 'Qualify', expectedClose: '2026-12-11' },
            ],
          },
        ],
        projects: [
          {
            id: 'claims-platform', name: 'Claims Platform', accountId: 'shield-property-insurance', deliveryManager: 'Prakash Menon',
            quarters: [
              { billableFte: 29, totalFte: 35, revenue: 1210, revenueTarget: 1200, cost: 750, marginPlan: 36.0, csat: 4.6, milestonesDue: 10, milestonesMet: 9, openEscalations: 0, attritionPct: 8.9 },
              { billableFte: 29, totalFte: 34, revenue: 1220, revenueTarget: 1230, cost: 760, marginPlan: 36.0, csat: 4.7, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 9.4 },
              { billableFte: 30, totalFte: 35, revenue: 1250, revenueTarget: 1230, cost: 770, marginPlan: 36.0, csat: 4.6, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 9.2 },
            ],
            nextMilestones: [
              { name: 'Release go-live', due: '2026-10-16', status: 'On track' },
              { name: 'UAT sign-off', due: '2026-10-30', status: 'On track' },
              { name: 'Quarterly business review', due: '2026-11-13', status: 'On track' },
            ],
          },
          {
            id: 'underwriting-workbench', name: 'Underwriting Workbench', accountId: 'shield-property-insurance', deliveryManager: 'Amanda Ross',
            quarters: [
              { billableFte: 19, totalFte: 23, revenue: 800, revenueTarget: 800, cost: 500, marginPlan: 36.0, csat: 4.5, milestonesDue: 12, milestonesMet: 12, openEscalations: 1, attritionPct: 10.8 },
              { billableFte: 20, totalFte: 24, revenue: 820, revenueTarget: 820, cost: 510, marginPlan: 36.0, csat: 4.6, milestonesDue: 13, milestonesMet: 13, openEscalations: 1, attritionPct: 11.3 },
              { billableFte: 20, totalFte: 24, revenue: 830, revenueTarget: 820, cost: 520, marginPlan: 36.0, csat: 4.5, milestonesDue: 12, milestonesMet: 12, openEscalations: 1, attritionPct: 11.1 },
            ],
            nextMilestones: [
              { name: 'Data migration wave', due: '2026-10-09', status: 'On track' },
              { name: 'Performance test complete', due: '2026-10-23', status: 'On track' },
              { name: 'Steering committee review', due: '2026-11-06', status: 'On track' },
            ],
          },
          {
            id: 'billing-migration', name: 'Billing Migration', accountId: 'granite-casualty', deliveryManager: 'Kunal Shah',
            quarters: [
              { billableFte: 34, totalFte: 41, revenue: 1410, revenueTarget: 1420, cost: 880, marginPlan: 36.0, csat: 4.4, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 12.4 },
              { billableFte: 34, totalFte: 40, revenue: 1420, revenueTarget: 1460, cost: 890, marginPlan: 36.0, csat: 4.5, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 13.6 },
              { billableFte: 35, totalFte: 41, revenue: 1460, revenueTarget: 1460, cost: 910, marginPlan: 36.0, csat: 4.4, milestonesDue: 12, milestonesMet: 11, openEscalations: 0, attritionPct: 14.6 },
            ],
            nextMilestones: [
              { name: 'Sprint demo to client', due: '2026-10-14', status: 'On track' },
              { name: 'Security audit closed', due: '2026-10-28', status: 'On track' },
              { name: 'Production cut-over', due: '2026-11-18', status: 'On track' },
            ],
          },
          {
            id: 'telematics-analytics', name: 'Telematics Analytics', accountId: 'harborline-auto', deliveryManager: 'Brian Foster',
            quarters: [
              { billableFte: 24, totalFte: 28, revenue: 1010, revenueTarget: 1030, cost: 630, marginPlan: 36.0, csat: 4.6, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 13.7 },
              { billableFte: 24, totalFte: 28, revenue: 1020, revenueTarget: 1040, cost: 640, marginPlan: 36.0, csat: 4.7, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 14.2 },
              { billableFte: 25, totalFte: 29, revenue: 1040, revenueTarget: 1040, cost: 650, marginPlan: 36.0, csat: 4.6, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 14.0 },
            ],
            nextMilestones: [
              { name: 'Integration testing done', due: '2026-10-21', status: 'On track' },
              { name: 'Client sign-off on design', due: '2026-11-04', status: 'At risk' },
              { name: 'Hypercare exit', due: '2026-11-25', status: 'On track' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'travel', name: 'Travel', buHead: 'Rahul Kapoor', deliveryHead: 'Daniel Brooks',
    subBus: [
      {
        id: 'airlines', name: 'Airlines', salesLead: 'Karan Malhotra', deliveryLead: 'Amit Verma',
        accounts: [
          {
            id: 'skybridge-airways', name: 'SkyBridge Airways', clientPartner: 'Ananya Singh',
            quarters: [
              { revenue: 2000, revenueTarget: 1960, deliveryCost: 1440, marginTarget: 31.0, bookings: 2120, bookingsTarget: 2100, pipeline: 7350, nextQuarterBookingsTarget: 2230, wonValue: 2120, lostValue: 2390, newPipeline: 2400, newPipelineTarget: 2310, priorYearRevenue: 1790 },
              { revenue: 2050, revenueTarget: 1980, deliveryCost: 1550, marginTarget: 31.0, bookings: 2320, bookingsTarget: 2230, pipeline: 7350, nextQuarterBookingsTarget: 2230, wonValue: 2320, lostValue: 2510, newPipeline: 2620, newPipelineTarget: 2450, priorYearRevenue: 1810 },
              { revenue: 2110, revenueTarget: 1980, deliveryCost: 1670, marginTarget: 31.0, bookings: 2390, bookingsTarget: 2230, pipeline: 7240, nextQuarterBookingsTarget: 2230, wonValue: 2390, lostValue: 2700, newPipeline: 2570, newPipelineTarget: 2450, priorYearRevenue: 1870 },
            ],
            openDeals: [
              { name: 'Digital channels revamp', value: 1880, stage: 'Propose', expectedClose: '2026-11-20' },
              { name: 'Application support renewal', value: 1230, stage: 'Negotiate', expectedClose: '2026-10-30' },
              { name: 'Pricing analytics pilot', value: 720, stage: 'Qualify', expectedClose: '2026-12-15' },
            ],
          },
          {
            id: 'aurora-air', name: 'Aurora Air', clientPartner: 'Chris Walker',
            quarters: [
              { revenue: 1400, revenueTarget: 1390, deliveryCost: 960, marginTarget: 31.0, bookings: 1470, bookingsTarget: 1500, pipeline: 4950, nextQuarterBookingsTarget: 1580, wonValue: 1470, lostValue: 1870, newPipeline: 1630, newPipelineTarget: 1650, priorYearRevenue: 1270 },
              { revenue: 1430, revenueTarget: 1410, deliveryCost: 980, marginTarget: 31.0, bookings: 1600, bookingsTarget: 1580, pipeline: 4950, nextQuarterBookingsTarget: 1580, wonValue: 1600, lostValue: 1960, newPipeline: 1770, newPipelineTarget: 1740, priorYearRevenue: 1280 },
              { revenue: 1480, revenueTarget: 1410, deliveryCost: 1010, marginTarget: 31.0, bookings: 1640, bookingsTarget: 1580, pipeline: 4880, nextQuarterBookingsTarget: 1580, wonValue: 1640, lostValue: 2090, newPipeline: 1740, newPipelineTarget: 1740, priorYearRevenue: 1330 },
            ],
            openDeals: [
              { name: 'Digital channels revamp', value: 1270, stage: 'Propose', expectedClose: '2026-12-05' },
              { name: 'Application support renewal', value: 830, stage: 'Negotiate', expectedClose: '2026-11-13' },
              { name: 'Pricing analytics pilot', value: 490, stage: 'Qualify', expectedClose: '2026-12-18' },
            ],
          },
          {
            id: 'pacific-jetlines', name: 'Pacific Jetlines', clientPartner: 'Manish Tiwari',
            quarters: [
              { revenue: 990, revenueTarget: 1000, deliveryCost: 680, marginTarget: 31.0, bookings: 1100, bookingsTarget: 1080, pipeline: 3610, nextQuarterBookingsTarget: 1140, wonValue: 1100, lostValue: 1340, newPipeline: 1230, newPipelineTarget: 1190, priorYearRevenue: 900 },
              { revenue: 1020, revenueTarget: 1010, deliveryCost: 700, marginTarget: 31.0, bookings: 1200, bookingsTarget: 1140, pipeline: 3610, nextQuarterBookingsTarget: 1140, wonValue: 1200, lostValue: 1410, newPipeline: 1330, newPipelineTarget: 1250, priorYearRevenue: 920 },
              { revenue: 1050, revenueTarget: 1010, deliveryCost: 720, marginTarget: 31.0, bookings: 1230, bookingsTarget: 1140, pipeline: 3560, nextQuarterBookingsTarget: 1140, wonValue: 1230, lostValue: 1500, newPipeline: 1300, newPipelineTarget: 1250, priorYearRevenue: 950 },
            ],
            openDeals: [
              { name: 'Digital channels revamp', value: 930, stage: 'Propose', expectedClose: '2026-11-27' },
              { name: 'Application support renewal', value: 610, stage: 'Negotiate', expectedClose: '2026-10-23' },
              { name: 'Pricing analytics pilot', value: 360, stage: 'Qualify', expectedClose: '2026-12-11' },
            ],
          },
        ],
        projects: [
          {
            id: 'crew-scheduling-platform', name: 'Crew Scheduling Platform', accountId: 'skybridge-airways', deliveryManager: 'Sandeep Yadav',
            quarters: [
              { billableFte: 29, totalFte: 37, revenue: 1200, revenueTarget: 1180, cost: 910, marginPlan: 31.0, csat: 4.0, milestonesDue: 10, milestonesMet: 9, openEscalations: 1, attritionPct: 14.2 },
              { billableFte: 29, totalFte: 38, revenue: 1230, revenueTarget: 1190, cost: 1010, marginPlan: 31.0, csat: 3.7, milestonesDue: 11, milestonesMet: 8, openEscalations: 2, attritionPct: 16.8 },
              { billableFte: 30, totalFte: 41, revenue: 1270, revenueTarget: 1190, cost: 1090, marginPlan: 31.0, csat: 3.4, milestonesDue: 11, milestonesMet: 7, openEscalations: 3, attritionPct: 19.4 },
            ],
            nextMilestones: [
              { name: 'Crew roster release 2', due: '2026-10-09', status: 'Late' },
              { name: 'Recovery plan agreed with client', due: '2026-10-16', status: 'At risk' },
              { name: 'Load test re-run', due: '2026-10-30', status: 'At risk' },
            ],
          },
          {
            id: 'loyalty-app-support', name: 'Loyalty App Support', accountId: 'skybridge-airways', deliveryManager: 'Lisa Park',
            quarters: [
              { billableFte: 19, totalFte: 23, revenue: 800, revenueTarget: 780, cost: 530, marginPlan: 31.0, csat: 4.4, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 10.8 },
              { billableFte: 20, totalFte: 24, revenue: 820, revenueTarget: 790, cost: 540, marginPlan: 31.0, csat: 4.3, milestonesDue: 13, milestonesMet: 13, openEscalations: 0, attritionPct: 11.3 },
              { billableFte: 20, totalFte: 25, revenue: 840, revenueTarget: 790, cost: 580, marginPlan: 31.0, csat: 4.2, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 11.1 },
            ],
            nextMilestones: [
              { name: 'Data migration wave', due: '2026-10-09', status: 'On track' },
              { name: 'Performance test complete', due: '2026-10-23', status: 'On track' },
              { name: 'Steering committee review', due: '2026-11-06', status: 'On track' },
            ],
          },
          {
            id: 'revenue-management', name: 'Revenue Management', accountId: 'aurora-air', deliveryManager: 'Arvind Kumar',
            quarters: [
              { billableFte: 33, totalFte: 40, revenue: 1400, revenueTarget: 1390, cost: 960, marginPlan: 31.0, csat: 4.3, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 10.2 },
              { billableFte: 34, totalFte: 41, revenue: 1430, revenueTarget: 1410, cost: 980, marginPlan: 31.0, csat: 4.2, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 10.7 },
              { billableFte: 35, totalFte: 43, revenue: 1480, revenueTarget: 1410, cost: 1010, marginPlan: 31.0, csat: 4.1, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 10.5 },
            ],
            nextMilestones: [
              { name: 'Sprint demo to client', due: '2026-10-14', status: 'On track' },
              { name: 'Security audit closed', due: '2026-10-28', status: 'At risk' },
              { name: 'Production cut-over', due: '2026-11-18', status: 'On track' },
            ],
          },
          {
            id: 'airport-ops-dashboard', name: 'Airport Ops Dashboard', accountId: 'pacific-jetlines', deliveryManager: 'Kevin Hughes',
            quarters: [
              { billableFte: 24, totalFte: 29, revenue: 990, revenueTarget: 1000, cost: 680, marginPlan: 31.0, csat: 4.5, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 11.3 },
              { billableFte: 24, totalFte: 28, revenue: 1020, revenueTarget: 1010, cost: 700, marginPlan: 31.0, csat: 4.4, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 11.8 },
              { billableFte: 25, totalFte: 30, revenue: 1050, revenueTarget: 1010, cost: 720, marginPlan: 31.0, csat: 4.3, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 11.6 },
            ],
            nextMilestones: [
              { name: 'Integration testing done', due: '2026-10-21', status: 'On track' },
              { name: 'Client sign-off on design', due: '2026-11-04', status: 'On track' },
              { name: 'Hypercare exit', due: '2026-11-25', status: 'On track' },
            ],
          },
        ],
      },
      {
        id: 'hospitality', name: 'Hospitality', salesLead: 'Laura Chen', deliveryLead: 'Olivia Martin',
        accounts: [
          {
            id: 'grand-vista-hotels', name: 'Grand Vista Hotels', clientPartner: 'Emma Scott',
            quarters: [
              { revenue: 1620, revenueTarget: 1600, deliveryCost: 1100, marginTarget: 31.0, bookings: 1700, bookingsTarget: 1720, pipeline: 6000, nextQuarterBookingsTarget: 1820, wonValue: 1700, lostValue: 2250, newPipeline: 1970, newPipelineTarget: 1890, priorYearRevenue: 1450 },
              { revenue: 1660, revenueTarget: 1620, deliveryCost: 1130, marginTarget: 31.0, bookings: 1860, bookingsTarget: 1820, pipeline: 6000, nextQuarterBookingsTarget: 1820, wonValue: 1860, lostValue: 2370, newPipeline: 2140, newPipelineTarget: 2000, priorYearRevenue: 1470 },
              { revenue: 1710, revenueTarget: 1620, deliveryCost: 1160, marginTarget: 31.0, bookings: 1910, bookingsTarget: 1820, pipeline: 5900, nextQuarterBookingsTarget: 1820, wonValue: 1910, lostValue: 2530, newPipeline: 2100, newPipelineTarget: 2000, priorYearRevenue: 1510 },
            ],
            openDeals: [
              { name: 'Digital channels revamp', value: 1530, stage: 'Propose', expectedClose: '2026-11-20' },
              { name: 'Application support renewal', value: 1000, stage: 'Negotiate', expectedClose: '2026-10-30' },
              { name: 'Pricing analytics pilot', value: 590, stage: 'Qualify', expectedClose: '2026-12-15' },
            ],
          },
          {
            id: 'coastal-resorts', name: 'Coastal Resorts', clientPartner: 'Rohit Saxena',
            quarters: [
              { revenue: 1130, revenueTarget: 1140, deliveryCost: 770, marginTarget: 31.0, bookings: 1260, bookingsTarget: 1220, pipeline: 4080, nextQuarterBookingsTarget: 1300, wonValue: 1260, lostValue: 1480, newPipeline: 1330, newPipelineTarget: 1340, priorYearRevenue: 1020 },
              { revenue: 1160, revenueTarget: 1150, deliveryCost: 790, marginTarget: 31.0, bookings: 1380, bookingsTarget: 1300, pipeline: 4080, nextQuarterBookingsTarget: 1300, wonValue: 1380, lostValue: 1560, newPipeline: 1460, newPipelineTarget: 1430, priorYearRevenue: 1040 },
              { revenue: 1200, revenueTarget: 1150, deliveryCost: 820, marginTarget: 31.0, bookings: 1420, bookingsTarget: 1300, pipeline: 4010, nextQuarterBookingsTarget: 1300, wonValue: 1420, lostValue: 1670, newPipeline: 1430, newPipelineTarget: 1430, priorYearRevenue: 1080 },
            ],
            openDeals: [
              { name: 'Digital channels revamp', value: 1040, stage: 'Propose', expectedClose: '2026-12-05' },
              { name: 'Application support renewal', value: 680, stage: 'Negotiate', expectedClose: '2026-11-13' },
              { name: 'Pricing analytics pilot', value: 400, stage: 'Qualify', expectedClose: '2026-12-18' },
            ],
          },
          {
            id: 'urbanstay-group', name: 'UrbanStay Group', clientPartner: 'Natalie Cruz',
            quarters: [
              { revenue: 810, revenueTarget: 810, deliveryCost: 550, marginTarget: 31.0, bookings: 880, bookingsTarget: 880, pipeline: 2950, nextQuarterBookingsTarget: 930, wonValue: 880, lostValue: 1080, newPipeline: 1000, newPipelineTarget: 970, priorYearRevenue: 740 },
              { revenue: 830, revenueTarget: 830, deliveryCost: 570, marginTarget: 31.0, bookings: 960, bookingsTarget: 930, pipeline: 2950, nextQuarterBookingsTarget: 930, wonValue: 960, lostValue: 1130, newPipeline: 1080, newPipelineTarget: 1020, priorYearRevenue: 750 },
              { revenue: 850, revenueTarget: 830, deliveryCost: 580, marginTarget: 31.0, bookings: 990, bookingsTarget: 930, pipeline: 2900, nextQuarterBookingsTarget: 930, wonValue: 990, lostValue: 1210, newPipeline: 1060, newPipelineTarget: 1020, priorYearRevenue: 770 },
            ],
            openDeals: [
              { name: 'Digital channels revamp', value: 750, stage: 'Propose', expectedClose: '2026-11-27' },
              { name: 'Application support renewal', value: 490, stage: 'Negotiate', expectedClose: '2026-10-23' },
              { name: 'Pricing analytics pilot', value: 290, stage: 'Qualify', expectedClose: '2026-12-11' },
            ],
          },
        ],
        projects: [
          {
            id: 'booking-engine', name: 'Booking Engine', accountId: 'grand-vista-hotels', deliveryManager: 'Shreya Ghosh',
            quarters: [
              { billableFte: 23, totalFte: 28, revenue: 970, revenueTarget: 960, cost: 660, marginPlan: 31.0, csat: 4.4, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 8.9 },
              { billableFte: 24, totalFte: 29, revenue: 1000, revenueTarget: 970, cost: 680, marginPlan: 31.0, csat: 4.2, milestonesDue: 12, milestonesMet: 11, openEscalations: 0, attritionPct: 9.4 },
              { billableFte: 25, totalFte: 30, revenue: 1030, revenueTarget: 970, cost: 700, marginPlan: 31.0, csat: 4.0, milestonesDue: 14, milestonesMet: 12, openEscalations: 0, attritionPct: 9.2 },
            ],
            nextMilestones: [
              { name: 'Release go-live', due: '2026-10-16', status: 'On track' },
              { name: 'UAT sign-off', due: '2026-10-30', status: 'On track' },
              { name: 'Quarterly business review', due: '2026-11-13', status: 'On track' },
            ],
          },
          {
            id: 'guest-data-platform', name: 'Guest Data Platform', accountId: 'grand-vista-hotels', deliveryManager: 'Paul Bennett',
            quarters: [
              { billableFte: 15, totalFte: 19, revenue: 650, revenueTarget: 640, cost: 440, marginPlan: 31.0, csat: 4.4, milestonesDue: 9, milestonesMet: 8, openEscalations: 0, attritionPct: 10.8 },
              { billableFte: 16, totalFte: 20, revenue: 660, revenueTarget: 650, cost: 450, marginPlan: 31.0, csat: 4.3, milestonesDue: 10, milestonesMet: 9, openEscalations: 1, attritionPct: 11.3 },
              { billableFte: 16, totalFte: 20, revenue: 680, revenueTarget: 650, cost: 460, marginPlan: 31.0, csat: 4.2, milestonesDue: 8, milestonesMet: 7, openEscalations: 1, attritionPct: 11.1 },
            ],
            nextMilestones: [
              { name: 'Data migration wave', due: '2026-10-09', status: 'On track' },
              { name: 'Performance test complete', due: '2026-10-23', status: 'On track' },
              { name: 'Steering committee review', due: '2026-11-06', status: 'On track' },
            ],
          },
          {
            id: 'property-management-cloud', name: 'Property Management Cloud', accountId: 'coastal-resorts', deliveryManager: 'Naveen Reddy',
            quarters: [
              { billableFte: 27, totalFte: 33, revenue: 1130, revenueTarget: 1140, cost: 770, marginPlan: 31.0, csat: 4.3, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 10.2 },
              { billableFte: 28, totalFte: 36, revenue: 1160, revenueTarget: 1150, cost: 790, marginPlan: 31.0, csat: 4.2, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 10.7 },
              { billableFte: 29, totalFte: 38, revenue: 1200, revenueTarget: 1150, cost: 820, marginPlan: 31.0, csat: 4.1, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 10.5 },
            ],
            nextMilestones: [
              { name: 'Sprint demo to client', due: '2026-10-14', status: 'On track' },
              { name: 'Security audit closed', due: '2026-10-28', status: 'On track' },
              { name: 'Production cut-over', due: '2026-11-18', status: 'On track' },
            ],
          },
          {
            id: 'loyalty-programme', name: 'Loyalty Programme', accountId: 'urbanstay-group', deliveryManager: 'Monica Diaz',
            quarters: [
              { billableFte: 19, totalFte: 23, revenue: 810, revenueTarget: 810, cost: 550, marginPlan: 31.0, csat: 4.5, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 13.7 },
              { billableFte: 20, totalFte: 24, revenue: 830, revenueTarget: 830, cost: 570, marginPlan: 31.0, csat: 4.4, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 14.2 },
              { billableFte: 20, totalFte: 24, revenue: 850, revenueTarget: 830, cost: 580, marginPlan: 31.0, csat: 4.3, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 14.0 },
            ],
            nextMilestones: [
              { name: 'Integration testing done', due: '2026-10-21', status: 'On track' },
              { name: 'Client sign-off on design', due: '2026-11-04', status: 'At risk' },
              { name: 'Hypercare exit', due: '2026-11-25', status: 'On track' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'healthcare', name: 'Healthcare', buHead: 'Sarah Whitman', deliveryHead: 'Anita Desai',
    subBus: [
      {
        id: 'payers', name: 'Payers', salesLead: 'Michael Grant', deliveryLead: 'Sanjay Patel',
        accounts: [
          {
            id: 'blueriver-health-plan', name: 'BlueRiver Health Plan', clientPartner: 'Deepak Chauhan',
            quarters: [
              { revenue: 1230, revenueTarget: 1240, deliveryCost: 810, marginTarget: 33.0, bookings: 1660, bookingsTarget: 1610, pipeline: 5170, nextQuarterBookingsTarget: 1730, wonValue: 1660, lostValue: 2290, newPipeline: 1730, newPipelineTarget: 1770, priorYearRevenue: 970 },
              { revenue: 1310, revenueTarget: 1340, deliveryCost: 860, marginTarget: 33.0, bookings: 1830, bookingsTarget: 1730, pipeline: 4630, nextQuarterBookingsTarget: 1730, wonValue: 1830, lostValue: 2630, newPipeline: 1730, newPipelineTarget: 1900, priorYearRevenue: 1020 },
              { revenue: 1410, revenueTarget: 1340, deliveryCost: 930, marginTarget: 33.0, bookings: 1890, bookingsTarget: 1730, pipeline: 4210, nextQuarterBookingsTarget: 1860, wonValue: 1890, lostValue: 2720, newPipeline: 1580, newPipelineTarget: 1900, priorYearRevenue: 1070 },
            ],
            openDeals: [
              { name: 'Interoperability programme', value: 1090, stage: 'Propose', expectedClose: '2026-11-20' },
              { name: 'Cloud operations extension', value: 720, stage: 'Negotiate', expectedClose: '2026-10-30' },
              { name: 'Analytics proof of concept', value: 420, stage: 'Qualify', expectedClose: '2026-12-15' },
            ],
          },
          {
            id: 'unity-health-insurance', name: 'Unity Health Insurance', clientPartner: 'Grace Liu',
            quarters: [
              { revenue: 860, revenueTarget: 880, deliveryCost: 570, marginTarget: 33.0, bookings: 1140, bookingsTarget: 1140, pipeline: 3500, nextQuarterBookingsTarget: 1230, wonValue: 1140, lostValue: 1780, newPipeline: 1160, newPipelineTarget: 1250, priorYearRevenue: 690 },
              { revenue: 910, revenueTarget: 950, deliveryCost: 600, marginTarget: 33.0, bookings: 1270, bookingsTarget: 1230, pipeline: 3130, nextQuarterBookingsTarget: 1230, wonValue: 1270, lostValue: 2070, newPipeline: 1160, newPipelineTarget: 1350, priorYearRevenue: 710 },
              { revenue: 980, revenueTarget: 950, deliveryCost: 650, marginTarget: 33.0, bookings: 1300, bookingsTarget: 1230, pipeline: 2850, nextQuarterBookingsTarget: 1320, wonValue: 1300, lostValue: 2120, newPipeline: 1050, newPipelineTarget: 1350, priorYearRevenue: 750 },
            ],
            openDeals: [
              { name: 'Interoperability programme', value: 740, stage: 'Propose', expectedClose: '2026-12-05' },
              { name: 'Cloud operations extension', value: 480, stage: 'Negotiate', expectedClose: '2026-11-13' },
              { name: 'Analytics proof of concept', value: 290, stage: 'Qualify', expectedClose: '2026-12-18' },
            ],
          },
          {
            id: 'clearpath-benefits', name: 'Clearpath Benefits', clientPartner: 'Sameer Kulkarni',
            quarters: [
              { revenue: 610, revenueTarget: 630, deliveryCost: 400, marginTarget: 33.0, bookings: 850, bookingsTarget: 820, pipeline: 2560, nextQuarterBookingsTarget: 890, wonValue: 850, lostValue: 1280, newPipeline: 870, newPipelineTarget: 900, priorYearRevenue: 490 },
              { revenue: 650, revenueTarget: 680, deliveryCost: 430, marginTarget: 33.0, bookings: 950, bookingsTarget: 890, pipeline: 2290, nextQuarterBookingsTarget: 890, wonValue: 950, lostValue: 1490, newPipeline: 880, newPipelineTarget: 980, priorYearRevenue: 510 },
              { revenue: 700, revenueTarget: 680, deliveryCost: 460, marginTarget: 33.0, bookings: 980, bookingsTarget: 890, pipeline: 2070, nextQuarterBookingsTarget: 950, wonValue: 980, lostValue: 1530, newPipeline: 800, newPipelineTarget: 980, priorYearRevenue: 540 },
            ],
            openDeals: [
              { name: 'Interoperability programme', value: 540, stage: 'Propose', expectedClose: '2026-11-27' },
              { name: 'Cloud operations extension', value: 350, stage: 'Negotiate', expectedClose: '2026-10-23' },
              { name: 'Analytics proof of concept', value: 210, stage: 'Qualify', expectedClose: '2026-12-11' },
            ],
          },
        ],
        projects: [
          {
            id: 'claims-adjudication', name: 'Claims Adjudication', accountId: 'blueriver-health-plan', deliveryManager: 'Rajesh Pillai',
            quarters: [
              { billableFte: 18, totalFte: 22, revenue: 740, revenueTarget: 740, cost: 490, marginPlan: 33.0, csat: 4.5, milestonesDue: 10, milestonesMet: 9, openEscalations: 0, attritionPct: 8.9 },
              { billableFte: 19, totalFte: 24, revenue: 790, revenueTarget: 800, cost: 520, marginPlan: 33.0, csat: 4.6, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 9.4 },
              { billableFte: 20, totalFte: 26, revenue: 850, revenueTarget: 800, cost: 560, marginPlan: 33.0, csat: 4.4, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 9.2 },
            ],
            nextMilestones: [
              { name: 'Release go-live', due: '2026-10-16', status: 'On track' },
              { name: 'UAT sign-off', due: '2026-10-30', status: 'On track' },
              { name: 'Quarterly business review', due: '2026-11-13', status: 'On track' },
            ],
          },
          {
            id: 'member-portal', name: 'Member Portal', accountId: 'blueriver-health-plan', deliveryManager: 'Hannah Scott',
            quarters: [
              { billableFte: 12, totalFte: 15, revenue: 490, revenueTarget: 500, cost: 320, marginPlan: 33.0, csat: 4.4, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 10.8 },
              { billableFte: 12, totalFte: 16, revenue: 520, revenueTarget: 540, cost: 340, marginPlan: 33.0, csat: 4.5, milestonesDue: 13, milestonesMet: 13, openEscalations: 0, attritionPct: 11.3 },
              { billableFte: 13, totalFte: 17, revenue: 560, revenueTarget: 540, cost: 370, marginPlan: 33.0, csat: 4.3, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 11.1 },
            ],
            nextMilestones: [
              { name: 'Data migration wave', due: '2026-10-09', status: 'On track' },
              { name: 'Performance test complete', due: '2026-10-23', status: 'On track' },
              { name: 'Steering committee review', due: '2026-11-06', status: 'On track' },
            ],
          },
          {
            id: 'provider-network-data', name: 'Provider Network Data', accountId: 'unity-health-insurance', deliveryManager: 'Mohit Arora',
            quarters: [
              { billableFte: 20, totalFte: 24, revenue: 860, revenueTarget: 880, cost: 570, marginPlan: 33.0, csat: 4.3, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 10.2 },
              { billableFte: 22, totalFte: 28, revenue: 910, revenueTarget: 950, cost: 600, marginPlan: 33.0, csat: 4.4, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 10.7 },
              { billableFte: 23, totalFte: 29, revenue: 980, revenueTarget: 950, cost: 650, marginPlan: 33.0, csat: 4.2, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 10.5 },
            ],
            nextMilestones: [
              { name: 'Sprint demo to client', due: '2026-10-14', status: 'On track' },
              { name: 'Security audit closed', due: '2026-10-28', status: 'At risk' },
              { name: 'Production cut-over', due: '2026-11-18', status: 'On track' },
            ],
          },
          {
            id: 'enrolment-automation', name: 'Enrolment Automation', accountId: 'clearpath-benefits', deliveryManager: 'Stephanie Young',
            quarters: [
              { billableFte: 15, totalFte: 18, revenue: 610, revenueTarget: 630, cost: 400, marginPlan: 33.0, csat: 4.5, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 11.3 },
              { billableFte: 15, totalFte: 18, revenue: 650, revenueTarget: 680, cost: 430, marginPlan: 33.0, csat: 4.6, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 11.8 },
              { billableFte: 17, totalFte: 21, revenue: 700, revenueTarget: 680, cost: 460, marginPlan: 33.0, csat: 4.4, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 11.6 },
            ],
            nextMilestones: [
              { name: 'Integration testing done', due: '2026-10-21', status: 'On track' },
              { name: 'Client sign-off on design', due: '2026-11-04', status: 'On track' },
              { name: 'Hypercare exit', due: '2026-11-25', status: 'On track' },
            ],
          },
        ],
      },
      {
        id: 'providers', name: 'Providers', salesLead: 'Divya Menon', deliveryLead: 'Rachel Adams',
        accounts: [
          {
            id: 'st-aria-medical-center', name: 'St. Aria Medical Center', clientPartner: 'Lauren Hayes',
            quarters: [
              { revenue: 1000, revenueTarget: 1010, deliveryCost: 660, marginTarget: 33.0, bookings: 1330, bookingsTarget: 1320, pipeline: 4240, nextQuarterBookingsTarget: 1420, wonValue: 1330, lostValue: 2170, newPipeline: 1420, newPipelineTarget: 1450, priorYearRevenue: 800 },
              { revenue: 1060, revenueTarget: 1090, deliveryCost: 700, marginTarget: 33.0, bookings: 1480, bookingsTarget: 1420, pipeline: 3800, nextQuarterBookingsTarget: 1420, wonValue: 1480, lostValue: 2520, newPipeline: 1420, newPipelineTarget: 1560, priorYearRevenue: 840 },
              { revenue: 1140, revenueTarget: 1090, deliveryCost: 750, marginTarget: 33.0, bookings: 1520, bookingsTarget: 1420, pipeline: 3440, nextQuarterBookingsTarget: 1520, wonValue: 1520, lostValue: 2590, newPipeline: 1290, newPipelineTarget: 1560, priorYearRevenue: 880 },
            ],
            openDeals: [
              { name: 'Interoperability programme', value: 890, stage: 'Propose', expectedClose: '2026-11-20' },
              { name: 'Cloud operations extension', value: 580, stage: 'Negotiate', expectedClose: '2026-10-30' },
              { name: 'Analytics proof of concept', value: 340, stage: 'Qualify', expectedClose: '2026-12-15' },
            ],
          },
          {
            id: 'northwind-clinics', name: 'Northwind Clinics', clientPartner: 'Abhishek Jain',
            quarters: [
              { revenue: 700, revenueTarget: 720, deliveryCost: 460, marginTarget: 33.0, bookings: 990, bookingsTarget: 940, pipeline: 2870, nextQuarterBookingsTarget: 1010, wonValue: 990, lostValue: 1420, newPipeline: 960, newPipelineTarget: 1030, priorYearRevenue: 570 },
              { revenue: 740, revenueTarget: 780, deliveryCost: 490, marginTarget: 33.0, bookings: 1090, bookingsTarget: 1010, pipeline: 2570, nextQuarterBookingsTarget: 1010, wonValue: 1090, lostValue: 1640, newPipeline: 950, newPipelineTarget: 1110, priorYearRevenue: 590 },
              { revenue: 800, revenueTarget: 780, deliveryCost: 530, marginTarget: 33.0, bookings: 1120, bookingsTarget: 1010, pipeline: 2330, nextQuarterBookingsTarget: 1080, wonValue: 1120, lostValue: 1680, newPipeline: 870, newPipelineTarget: 1110, priorYearRevenue: 620 },
            ],
            openDeals: [
              { name: 'Interoperability programme', value: 610, stage: 'Propose', expectedClose: '2026-12-05' },
              { name: 'Cloud operations extension', value: 400, stage: 'Negotiate', expectedClose: '2026-11-13' },
              { name: 'Analytics proof of concept', value: 230, stage: 'Qualify', expectedClose: '2026-12-18' },
            ],
          },
          {
            id: 'lakeside-health-system', name: 'Lakeside Health System', clientPartner: 'Tanya Fernandes',
            quarters: [
              { revenue: 500, revenueTarget: 520, deliveryCost: 330, marginTarget: 33.0, bookings: 680, bookingsTarget: 670, pipeline: 2070, nextQuarterBookingsTarget: 720, wonValue: 680, lostValue: 1020, newPipeline: 720, newPipelineTarget: 740, priorYearRevenue: 410 },
              { revenue: 530, revenueTarget: 560, deliveryCost: 350, marginTarget: 33.0, bookings: 760, bookingsTarget: 720, pipeline: 1850, nextQuarterBookingsTarget: 720, wonValue: 760, lostValue: 1190, newPipeline: 710, newPipelineTarget: 790, priorYearRevenue: 430 },
              { revenue: 570, revenueTarget: 560, deliveryCost: 380, marginTarget: 33.0, bookings: 780, bookingsTarget: 720, pipeline: 1680, nextQuarterBookingsTarget: 770, wonValue: 780, lostValue: 1220, newPipeline: 650, newPipelineTarget: 790, priorYearRevenue: 450 },
            ],
            openDeals: [
              { name: 'Interoperability programme', value: 440, stage: 'Propose', expectedClose: '2026-11-27' },
              { name: 'Cloud operations extension', value: 290, stage: 'Negotiate', expectedClose: '2026-10-23' },
              { name: 'Analytics proof of concept', value: 170, stage: 'Qualify', expectedClose: '2026-12-11' },
            ],
          },
        ],
        projects: [
          {
            id: 'ehr-integration', name: 'EHR Integration', accountId: 'st-aria-medical-center', deliveryManager: 'Vinod Krishnan',
            quarters: [
              { billableFte: 14, totalFte: 18, revenue: 600, revenueTarget: 610, cost: 390, marginPlan: 33.0, csat: 4.4, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 8.9 },
              { billableFte: 15, totalFte: 19, revenue: 640, revenueTarget: 650, cost: 420, marginPlan: 33.0, csat: 4.3, milestonesDue: 12, milestonesMet: 11, openEscalations: 0, attritionPct: 9.4 },
              { billableFte: 16, totalFte: 21, revenue: 680, revenueTarget: 650, cost: 450, marginPlan: 33.0, csat: 4.1, milestonesDue: 14, milestonesMet: 12, openEscalations: 0, attritionPct: 9.2 },
            ],
            nextMilestones: [
              { name: 'Release go-live', due: '2026-10-16', status: 'On track' },
              { name: 'UAT sign-off', due: '2026-10-30', status: 'On track' },
              { name: 'Quarterly business review', due: '2026-11-13', status: 'On track' },
            ],
          },
          {
            id: 'revenue-cycle-analytics', name: 'Revenue Cycle Analytics', accountId: 'st-aria-medical-center', deliveryManager: 'Julia Evans',
            quarters: [
              { billableFte: 10, totalFte: 13, revenue: 400, revenueTarget: 400, cost: 270, marginPlan: 33.0, csat: 4.2, milestonesDue: 12, milestonesMet: 12, openEscalations: 1, attritionPct: 10.8 },
              { billableFte: 10, totalFte: 13, revenue: 420, revenueTarget: 440, cost: 280, marginPlan: 33.0, csat: 4.1, milestonesDue: 13, milestonesMet: 13, openEscalations: 1, attritionPct: 11.3 },
              { billableFte: 11, totalFte: 14, revenue: 460, revenueTarget: 440, cost: 300, marginPlan: 33.0, csat: 4.0, milestonesDue: 12, milestonesMet: 12, openEscalations: 1, attritionPct: 11.1 },
            ],
            nextMilestones: [
              { name: 'Data migration wave', due: '2026-10-09', status: 'On track' },
              { name: 'Performance test complete', due: '2026-10-23', status: 'On track' },
              { name: 'Steering committee review', due: '2026-11-06', status: 'On track' },
            ],
          },
          {
            id: 'patient-scheduling', name: 'Patient Scheduling', accountId: 'northwind-clinics', deliveryManager: 'Tarun Bhatia',
            quarters: [
              { billableFte: 17, totalFte: 22, revenue: 700, revenueTarget: 720, cost: 460, marginPlan: 33.0, csat: 4.3, milestonesDue: 11, milestonesMet: 11, openEscalations: 0, attritionPct: 10.2 },
              { billableFte: 18, totalFte: 24, revenue: 740, revenueTarget: 780, cost: 490, marginPlan: 33.0, csat: 4.4, milestonesDue: 12, milestonesMet: 12, openEscalations: 0, attritionPct: 10.7 },
              { billableFte: 19, totalFte: 25, revenue: 800, revenueTarget: 780, cost: 530, marginPlan: 33.0, csat: 4.2, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 10.5 },
            ],
            nextMilestones: [
              { name: 'Sprint demo to client', due: '2026-10-14', status: 'On track' },
              { name: 'Security audit closed', due: '2026-10-28', status: 'On track' },
              { name: 'Production cut-over', due: '2026-11-18', status: 'On track' },
            ],
          },
          {
            id: 'care-analytics', name: 'Care Analytics', accountId: 'lakeside-health-system', deliveryManager: 'Carlos Rivera',
            quarters: [
              { billableFte: 12, totalFte: 15, revenue: 500, revenueTarget: 520, cost: 330, marginPlan: 33.0, csat: 4.5, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 13.7 },
              { billableFte: 13, totalFte: 17, revenue: 530, revenueTarget: 560, cost: 350, marginPlan: 33.0, csat: 4.6, milestonesDue: 11, milestonesMet: 10, openEscalations: 0, attritionPct: 14.2 },
              { billableFte: 14, totalFte: 18, revenue: 570, revenueTarget: 560, cost: 380, marginPlan: 33.0, csat: 4.4, milestonesDue: 10, milestonesMet: 10, openEscalations: 0, attritionPct: 14.0 },
            ],
            nextMilestones: [
              { name: 'Integration testing done', due: '2026-10-21', status: 'On track' },
              { name: 'Client sign-off on design', due: '2026-11-04', status: 'At risk' },
              { name: 'Hypercare exit', due: '2026-11-25', status: 'On track' },
            ],
          },
        ],
      },
    ],
  },
];
