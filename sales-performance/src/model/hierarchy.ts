import {BUSINESS_UNITS, type Account, type Bu, type Project, type SubBu} from '../data/staticData';

export type Page = 'sales' | 'delivery';
export type Level = 'company' | 'bu' | 'subBu' | 'person';

/** Where the user is. `personId` is an account id on Sales and a project id on Delivery. */
export interface Selection {
  buId?: string;
  subBuId?: string;
  personId?: string;
}

/** A group of accounts and projects that can be measured: the company, a BU, a Sub-BU or one person. */
export interface Unit {
  key: string;
  name: string;
  /** e.g. "Arjun Mehta, BU Head" */
  owner: string;
  selection: Selection;
  accounts: readonly Account[];
  projects: readonly Project[];
  /** Units one level down that make up this unit (BUs, Sub-BUs or people) */
  parts: Unit[];
}

export interface View {
  page: Page;
  level: Level;
  unit: Unit;
  /** Rows of the comparison table (empty at person level) */
  children: Unit[];
  /** Person level only: the project rows (projects in the account on Sales, the one project on Delivery) */
  projectRows: Unit[];
  /** Person level only: the other people in the same sub-business unit, used for comparisons */
  peers: Unit[];
  bu?: Bu;
  subBu?: SubBu;
  account?: Account;
  project?: Project;
}

const accountsOf = (bu: Bu) => bu.subBus.flatMap(subBu => subBu.accounts);
const projectsOf = (bu: Bu) => bu.subBus.flatMap(subBu => subBu.projects);

function personUnits(page: Page, bu: Bu, subBu: SubBu): Unit[] {
  if (page === 'sales') {
    return subBu.accounts.map(account => ({
      key: account.id,
      name: account.clientPartner,
      owner: account.name,
      selection: {buId: bu.id, subBuId: subBu.id, personId: account.id},
      accounts: [account],
      projects: subBu.projects.filter(project => project.accountId === account.id),
      parts: [],
    }));
  }
  return subBu.projects.map(project => ({
    key: project.id,
    name: project.deliveryManager,
    owner: project.name,
    selection: {buId: bu.id, subBuId: subBu.id, personId: project.id},
    accounts: subBu.accounts.filter(account => account.id === project.accountId),
    projects: [project],
    parts: [],
  }));
}

function subBuUnit(page: Page, bu: Bu, subBu: SubBu): Unit {
  return {
    key: subBu.id,
    name: subBu.name,
    owner: page === 'sales' ? `${subBu.salesLead}, Sales Lead` : `${subBu.deliveryLead}, Delivery Lead`,
    selection: {buId: bu.id, subBuId: subBu.id},
    accounts: subBu.accounts,
    projects: subBu.projects,
    parts: personUnits(page, bu, subBu),
  };
}

function buUnit(page: Page, bu: Bu): Unit {
  return {
    key: bu.id,
    name: bu.name,
    owner: page === 'sales' ? `${bu.buHead}, Business Unit Head` : `${bu.deliveryHead}, Delivery Head`,
    selection: {buId: bu.id},
    accounts: accountsOf(bu),
    projects: projectsOf(bu),
    parts: bu.subBus.map(subBu => subBuUnit(page, bu, subBu)),
  };
}

export function companyUnit(page: Page): Unit {
  const parts = BUSINESS_UNITS.map(bu => buUnit(page, bu));
  return {
    key: 'company',
    name: 'Company',
    owner: 'CEO view · all business units',
    selection: {},
    accounts: BUSINESS_UNITS.flatMap(accountsOf),
    projects: BUSINESS_UNITS.flatMap(projectsOf),
    parts,
  };
}

/** A single project as a table row; projects are the last level, so it has no parts. */
function projectUnit(page: Page, bu: Bu, subBu: SubBu, account: Account, project: Project): Unit {
  return {
    key: project.id,
    name: project.name,
    owner: page === 'sales' ? project.deliveryManager : `${account.name} · ${account.clientPartner}`,
    selection: {buId: bu.id, subBuId: subBu.id, personId: project.id},
    accounts: [account],
    projects: [project],
    parts: [],
  };
}

/** Resolves a selection to a view, dropping any part of the selection that does not exist. */
export function resolveView(page: Page, selection: Selection): View {
  const company = companyUnit(page);
  const bu = BUSINESS_UNITS.find(b => b.id === selection.buId);
  if (!bu) return {page, level: 'company', unit: company, children: company.parts, projectRows: [], peers: []};
  const buView = company.parts.find(u => u.key === bu.id)!;
  const subBu = bu.subBus.find(s => s.id === selection.subBuId);
  if (!subBu) return {page, level: 'bu', unit: buView, children: buView.parts, projectRows: [], peers: [], bu};
  const subView = buView.parts.find(u => u.key === subBu.id)!;
  const person = subView.parts.find(u => u.key === selection.personId);
  if (!person) return {page, level: 'subBu', unit: subView, children: subView.parts, projectRows: [], peers: [], bu, subBu};
  const account = person.accounts[0];
  return {
    page,
    level: 'person',
    unit: person,
    children: [],
    projectRows: person.projects.map(project => projectUnit(page, bu, subBu, account, project)),
    peers: subView.parts,
    bu,
    subBu,
    account,
    project: page === 'delivery' ? person.projects[0] : undefined,
  };
}

/** Keeps BU and Sub-BU when switching page; a person only exists on one page. */
export const selectionForPage = (selection: Selection): Selection => ({buId: selection.buId, subBuId: selection.subBuId});
