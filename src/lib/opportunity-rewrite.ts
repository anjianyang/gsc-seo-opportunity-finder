import type { CleanOpportunity } from "./opportunity-detection";

export type OpportunityRewrite = {
  opportunityId: string;
  titleSuggestions: string[];
  metaDescriptionSuggestions: string[];
  seoActionText: string;
  reportWording: string;
};

export function rewriteOpportunities(
  opportunities: CleanOpportunity[],
): OpportunityRewrite[] {
  return opportunities.map((opportunity) => ({
    opportunityId: opportunity.id,
    titleSuggestions: generateTitleSuggestions(opportunity),
    metaDescriptionSuggestions: generateMetaDescriptionSuggestions(opportunity),
    seoActionText: generateSeoActionText(opportunity),
    reportWording: improveReportWording(opportunity),
  }));
}

function generateTitleSuggestions(opportunity: CleanOpportunity) {
  const keyword = opportunity.keyword || opportunity.query;

  if (opportunity.type === "High Impression Low CTR") {
    return [
      `Best ${keyword}: Compare Features, Benefits, and Pricing`,
      `${keyword}: A Practical Buying Guide for Pet Owners`,
    ];
  }

  if (opportunity.type === "Position 11-20 Opportunity") {
    return [
      `${keyword}: Complete Guide, FAQs, and Expert Tips`,
      `How to Choose ${keyword}: Features, Use Cases, and Recommendations`,
    ];
  }

  return [
    `${keyword}: Complete Guide for Better Pet Grooming Results`,
    `What to Know About ${keyword} Before You Buy`,
  ];
}

function generateMetaDescriptionSuggestions(opportunity: CleanOpportunity) {
  const keyword = opportunity.keyword || opportunity.query;

  return [
    `Learn how to choose ${keyword}, compare key features, and find the right grooming setup for your pet.`,
    `Explore practical tips, product considerations, and next steps for ${keyword}.`,
  ];
}

function generateSeoActionText(opportunity: CleanOpportunity) {
  return opportunity.recommendedActions.join("; ");
}

function improveReportWording(opportunity: CleanOpportunity) {
  return `${opportunity.type}: ${opportunity.whyThisMatters} Recommended next step: ${opportunity.recommendedAction}`;
}
