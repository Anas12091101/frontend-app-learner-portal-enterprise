// Features
export const FEATURE_ENROLL_WITH_CODES = 'ENROLL_WITH_CODES';
export const FEATURE_ENABLE_PROGRAMS = 'ENABLE_PROGRAMS';
export const FEATURE_ENABLE_PATHWAYS = 'ENABLE_PATHWAYS';
export const FEATURE_ENABLE_COURSE_REVIEW = 'ENABLE_COURSE_REVIEW';
export const FEATURE_ENABLE_PATHWAY_PROGRESS = 'ENABLE_PATHWAY_PROGRESS';
export const FEATURE_ENABLE_MY_CAREER = 'ENABLE_MY_CAREER';
export const FEATURE_PROGRAM_TYPE_FACET = 'ENABLE_PROGRAM_TYPE_FACET';
export const FEATURE_ENABLE_AUTO_APPLIED_LICENSES = 'FEATURE_ENABLE_AUTO_APPLIED_LICENSES';
export const FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS = 'FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS';

// Subscription expiration constants
export const SUBSCRIPTION_DAYS_REMAINING_SEVERE = 60;
export const SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL = 30;
export const SUBSCRIPTION_EXPIRED = 0;

// Prefix for cookies that determine if the user has seen the modal for that range of expiration
// Using the same cookie name as Admin Portal so an Admin/Learner only sees the notification once
export const SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX = 'seen-expiration-modal-';
