import { Claim } from '../types';
import { evaluateRiskFlags } from '../utils/riskAnalyzer';

interface SeedItem {
  id: string;
  text: string;
  sourcePlatform: Claim['sourcePlatform'];
  sourceUrl?: string;
  category: Claim['category'];
  region: string;
  status: Claim['status'];
  submittedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
  reviewerName?: string;
  verificationSourceUrl?: string;
}

const rawSeeds: SeedItem[] = [
  {
    id: 'claim-101',
    text: 'BREAKING: RBI ANNOUNCES THAT ALL ₹500 NOTES WITH STAR MARKS WILL BE INVALID NEXT MONTH! URGENT SHARE TO ALL FAMILY GROUPS BEFORE DELETED!',
    sourcePlatform: 'WhatsApp',
    sourceUrl: '',
    category: 'Finance',
    region: 'Pan-India',
    status: 'False',
    submittedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35m ago
    reviewedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    reviewerNote: 'RBI officially clarified that ₹500 banknotes with a star symbol in the number panel are 100% genuine and legal tender. The star mark denotes a replacement for a defectively printed note during batch production.',
    reviewerName: 'Priya Sharma (Fact-Check Lead)',
    verificationSourceUrl: 'https://rbi.org.in',
  },
  {
    id: 'claim-102',
    text: 'SHOCKING SECRET: BOILING RAW PAPAYA LEAF WATER CURES SEVERE DENGUE IN 6 HOURS! HOSPITALS ARE CONCEALING THIS! SHARE BEFORE DELETED!',
    sourcePlatform: 'WhatsApp',
    sourceUrl: '',
    category: 'Health',
    region: 'Delhi NCR',
    status: 'False',
    submittedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(), // 80m ago
    reviewedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    reviewerNote: 'Medical authorities and the Indian Medical Association (IMA) caution that dengue requires strict clinical platelet monitoring and IV hydration. Home remedies do not cure viral dengue in hours; delaying medical care can cause dangerous hemorrhage.',
    reviewerName: 'Dr. A. Sen (Civic Health Desk)',
    verificationSourceUrl: 'https://mohfw.gov.in',
  },
  {
    id: 'claim-103',
    text: 'Ministry of Railways has restored the 20% senior citizen fare concession on all Vande Bharat and Rajdhani express trains starting from next week.',
    sourcePlatform: 'X',
    sourceUrl: '',
    category: 'Other',
    region: 'Pan-India',
    status: 'Misleading',
    submittedAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    reviewerNote: 'While a Parliamentary standing committee recommended reconsidering fare concessions for senior citizens, the Ministry of Railways has not issued any gazette notification or order restoring discounts.',
    reviewerName: 'Rohan Deshmukh (Civic Reporter)',
    verificationSourceUrl: 'https://pib.gov.in',
  },
  {
    id: 'claim-104',
    text: 'PM Surya Ghar Muft Bijli Yojana provides central financial assistance of up to ₹78,000 for installing 3kW rooftop solar systems in residential homes. Registration is open at the official portal.',
    sourcePlatform: 'Instagram',
    sourceUrl: 'https://pmsuryaghar.gov.in',
    category: 'Finance',
    region: 'Pan-India',
    status: 'Verified True',
    submittedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
    reviewerNote: 'Claim verified directly against the Ministry of New and Renewable Energy (MNRE) guidelines for PM Surya Ghar Scheme launched in 2024.',
    reviewerName: 'Kavita Iyer (Editorial Desk)',
    verificationSourceUrl: 'https://pmsuryaghar.gov.in',
  },
  {
    id: 'claim-105',
    text: 'ALERT: Tap this link to claim ₹4,500 festive financial aid credited by Government into your UPI account. Only valid for 24 hours for registered mobile numbers.',
    sourcePlatform: 'WhatsApp',
    sourceUrl: '',
    category: 'Finance',
    region: 'Uttar Pradesh',
    status: 'False',
    submittedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    reviewerNote: 'Known phishing lure designed to steal UPI credentials. No government department dispenses cash grants via random SMS or WhatsApp links asking users to enter their UPI PIN.',
    reviewerName: 'Cyber Crime Triage Desk',
    verificationSourceUrl: 'https://cybercrime.gov.in',
  },
  {
    id: 'claim-106',
    text: 'IMD issues orange alert for heavy to very heavy rainfall in Mumbai and Thane coastal belt over the next 36 hours. Disaster management teams deployed.',
    sourcePlatform: 'X',
    sourceUrl: 'https://mausam.imd.gov.in',
    category: 'Other',
    region: 'Mumbai',
    status: 'Unverified',
    submittedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'claim-107',
    text: 'ELECTION COMMISSION EXTENDS POLLING HOURS TILL 8 PM IN RURAL CONSTITUENCIES DUE TO SUMMER HEATWAVE! SHARE TO INFORM VOTERS!',
    sourcePlatform: 'WhatsApp',
    sourceUrl: '',
    category: 'Politics',
    region: 'Bihar',
    status: 'Unverified',
    submittedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
];

export const initialClaims: Claim[] = rawSeeds.map(item => {
  const { flags, isHighRisk } = evaluateRiskFlags(item.text, item.sourceUrl);
  return {
    ...item,
    flags,
    isHighRisk,
    revisions: [],
    upvotes: Math.floor(Math.random() * 24) + 3,
  };
});
