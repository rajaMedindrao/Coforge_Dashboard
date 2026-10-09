import {BUSINESS_UNITS} from '../../../sales-performance/src/data/staticData';
import {ACCOUNTS, isOpen, type GrowthAccount} from './growth';
import type {Opportunity} from '../data/growthData';

export type GrowthLevel = 'company' | 'bu' | 'subBu' | 'account' | 'opportunity';

export interface GrowthSelection {
  buId?: string;
  subBuId?: string;
  accountId?: string;
  opportunityId?: string;
}

/** The top 20, a BU, a Sub-BU or one account. */
export interface GrowthUnit {
  key: string;
  name: string;
  owner: string;
  level: GrowthLevel;
  selection: GrowthSelection;
  accounts: readonly GrowthAccount[];
  parts: GrowthUnit[];
}

export interface GrowthView {
  level: GrowthLevel;
  unit: GrowthUnit;
  /** Rows of the comparison table (empty at account level) */
  children: GrowthUnit[];
  bu?: GrowthUnit;
  subBu?: GrowthUnit;
  account?: GrowthAccount;
  opportunity?: Opportunity;
}

function accountUnit(account: GrowthAccount): GrowthUnit {
  return {
    key: account.id,
    name: account.name,
    owner: account.clientPartner,
    level: 'account',
    selection: {buId: account.buId, subBuId: account.subBuId, accountId: account.id},
    accounts: [account],
    parts: [],
  };
}

export const GROWTH_COMPANY: GrowthUnit = {
  key: 'company',
  name: 'Top 20 accounts',
  owner: 'CEO view · top 20 strategic accounts',
  level: 'company',
  selection: {},
  accounts: ACCOUNTS,
  parts: BUSINESS_UNITS.map(bu => {
    const buAccounts = ACCOUNTS.filter(a => a.buId === bu.id);
    return {
      key: bu.id,
      name: bu.name,
      owner: bu.buHead,
      level: 'bu' as const,
      selection: {buId: bu.id},
      accounts: buAccounts,
      parts: bu.subBus.map(subBu => {
        const subAccounts = buAccounts.filter(a => a.subBuId === subBu.id);
        return {
          key: subBu.id,
          name: subBu.name,
          owner: subBu.salesLead,
          level: 'subBu' as const,
          selection: {buId: bu.id, subBuId: subBu.id},
          accounts: subAccounts,
          parts: subAccounts.map(accountUnit),
        };
      }),
    };
  }),
};

/** Resolves a selection to a view, dropping any part of the selection that does not exist. */
export function resolveGrowthView(selection: GrowthSelection): GrowthView {
  const company = GROWTH_COMPANY;
  const bu = company.parts.find(u => u.key === selection.buId);
  if (!bu) return {level: 'company', unit: company, children: company.parts};
  const subBu = bu.parts.find(u => u.key === selection.subBuId);
  if (!subBu) return {level: 'bu', unit: bu, children: bu.parts, bu};
  const unit = subBu.parts.find(u => u.key === selection.accountId);
  if (!unit) return {level: 'subBu', unit: subBu, children: subBu.parts, bu, subBu};
  const account = unit.accounts[0];
  const opportunity = account.opportunities.find(o => o.id === selection.opportunityId && isOpen(o));
  return {level: opportunity ? 'opportunity' : 'account', unit, children: [], bu, subBu, account, opportunity};
}
