import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import {
  COUPON_CODE_SUBSIDY_TYPE,
  COURSE_AVAILABILITY_MAP,
  DISABLED_ENROLL_REASON_TYPES,
  ENTERPRISE_OFFER_SUBSIDY_TYPE,
  LICENSE_SUBSIDY_TYPE,
} from '../constants';
import {
  courseUsesEntitlementPricing,
  findCouponCodeForCourse,
  findEnterpriseOfferForCourse,
  getAvailableCourseRunKeysFromCourseData,
  getAvailableCourseRuns,
  getSubsidyToApplyForCourse,
  linkToCourse,
  pathContainsCourseTypeSlug,
  getCourseStartDate,
  getMissingSubsidyReasonActions,
  getSubscriptionDisabledEnrollmentReasonType,
  isActiveSubscriptionLicense,
} from '../utils';

jest.mock('@edx/frontend-platform/config', () => ({
  ensureConfig: jest.fn(),
  getConfig: () => ({
    LEARNER_SUPPORT_SPEND_ENROLLMENT_LIMITS_URL: 'https://limits.url',
    LEARNER_SUPPORT_ABOUT_DEACTIVATION_URL: 'https://deactivation.url',
    COURSE_TYPE_CONFIG: {
      entitlement_course: {
        pathSlug: 'executive-education-2u',
        usesEntitlementListPrice: true,
      },
      'executive-education-2u': {
        pathSlug: 'executive-education-2u',
        usesEntitlementListPrice: true,
        usesAdditionalMetadata: true,
      },
    },
  }),
}));

describe('findCouponCodeForCourse', () => {
  const couponCodes = [{
    code: 'bearsRus',
    catalog: 'bears',
    couponStartDate: dayjs().subtract(1, 'w').toISOString(),
    couponEndDate: dayjs().add(8, 'w').toISOString(),
  }];

  test('returns valid index if coupon code catalog is in catalog list', () => {
    const catalogsWithCourse = ['cats', 'bears'];
    expect(findCouponCodeForCourse(couponCodes, catalogsWithCourse)).toEqual(couponCodes[0]);
  });

  test('returns undefined if catalog list is empty', () => {
    expect(findCouponCodeForCourse(couponCodes)).toBeUndefined();
  });
});

describe('findEnterpriseOfferForCourse', () => {
  const coursePrice = 100;
  const enterpriseCatalogUuid = 'test-enterprise-catalog-uuid';
  const catalogsWithCourse = [enterpriseCatalogUuid];
  const offerNoLimit = {
    enterpriseCatalogUuid,
  };
  const offerRemainingBalanceNoApplications = {
    enterpriseCatalogUuid,
    remainingBalance: 500,
  };
  const offerNotEnoughRemainingBalanceNoApplications = {
    enterpriseCatalogUuid,
    remainingBalance: 50,
  };
  const offerNoRemainingBalanceNoApplications = {
    enterpriseCatalogUuid,
    remainingBalance: 0,
  };
  const offerRemainingBalanceForUserNoApplications = {
    enterpriseCatalogUuid,
    remainingBalance: 500,
    remainingBalanceForUser: 200,
  };
  const offerNotEnoughRemainingBalanceForUserNoApplications = {
    enterpriseCatalogUuid,
    remainingBalance: 500,
    remainingBalanceForUser: 50,
  };
  const offerNoRemainingBalanceForUserNoApplications = {
    enterpriseCatalogUuid,
    remainingBalance: 500,
    remainingBalanceForUser: 0,
  };
  const offerRemainingApplicationsNoBalance = {
    enterpriseCatalogUuid,
    remainingApplications: 10,
  };
  const offerNoRemainingApplicationsNoBalance = {
    enterpriseCatalogUuid,
    remainingApplicationsForUser: 0,
  };
  const offerRemainingApplicationsForUserNoBalance = {
    enterpriseCatalogUuid,
    remainingApplications: 10,
    remainingApplicationsForUser: 1,
  };
  const offerNoRemainingApplicationsForUserNoBalance = {
    enterpriseCatalogUuid,
    remainingApplications: 10,
    remainingApplicationsForUser: 0,
  };

  it('returns undefined with no course price', () => {
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers: [offerRemainingBalanceForUserNoApplications],
      catalogsWithCourse,
      coursePrice: undefined,
    });
    expect(result).toEqual(undefined);
  });

  it('returns undefined with no enterprise offers', () => {
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers: [],
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(undefined);
  });

  it('returns undefined with no enterprise offers associated with catalog containing course', () => {
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers: [{ enterpriseCatalogUuid: 'not-in-catalog' }],
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(undefined);
  });

  it('returns offer with no limit first', () => {
    const enterpriseOffers = [
      offerNotEnoughRemainingBalanceForUserNoApplications,
      offerNoRemainingBalanceNoApplications,
      offerRemainingBalanceNoApplications,
      offerRemainingBalanceForUserNoApplications,
      offerNoRemainingApplicationsNoBalance,
      offerNotEnoughRemainingBalanceNoApplications,
      offerRemainingApplicationsNoBalance,
      offerNoRemainingApplicationsForUserNoBalance,
      offerNoRemainingBalanceForUserNoApplications,
      offerRemainingApplicationsForUserNoBalance,
      offerNoLimit,
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerNoLimit);
  });

  it('returns offer with remaining balance for user first', () => {
    const enterpriseOffers = [
      offerNotEnoughRemainingBalanceForUserNoApplications,
      offerNoRemainingBalanceNoApplications,
      offerRemainingBalanceNoApplications,
      offerRemainingBalanceForUserNoApplications,
      offerNoRemainingApplicationsNoBalance,
      offerNotEnoughRemainingBalanceNoApplications,
      offerRemainingApplicationsNoBalance,
      offerNoRemainingBalanceForUserNoApplications,
      offerNoRemainingApplicationsForUserNoBalance,
      offerRemainingApplicationsForUserNoBalance,
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerRemainingBalanceForUserNoApplications);
  });

  it('returns offer with remaining balance first', () => {
    const enterpriseOffers = [
      offerNotEnoughRemainingBalanceForUserNoApplications,
      offerNoRemainingBalanceNoApplications,
      offerRemainingBalanceNoApplications,
      offerNoRemainingApplicationsNoBalance,
      offerNotEnoughRemainingBalanceNoApplications,
      offerRemainingApplicationsNoBalance,
      offerNoRemainingApplicationsForUserNoBalance,
      offerNoRemainingBalanceForUserNoApplications,
      offerRemainingApplicationsForUserNoBalance,
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerRemainingBalanceNoApplications);
  });

  it('returns offer with remaining applications for user first', () => {
    const enterpriseOffers = [
      offerNoRemainingBalanceNoApplications,
      offerNoRemainingApplicationsNoBalance,
      offerNotEnoughRemainingBalanceNoApplications,
      offerRemainingApplicationsNoBalance,
      offerNoRemainingApplicationsForUserNoBalance,
      offerNoRemainingBalanceForUserNoApplications,
      offerRemainingApplicationsForUserNoBalance,
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerRemainingApplicationsForUserNoBalance);
  });

  it('returns the redeemable enterprise offer', () => {
    const enterpriseOffers = [
      offerRemainingBalanceNoApplications,
      offerNoRemainingBalanceNoApplications,
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerRemainingBalanceNoApplications);
  });

  it('returns enterprise offer with null balance before enterprise offer with null balance', () => {
    const enterpriseOffers = [
      offerNoLimit,
      offerRemainingBalanceNoApplications,
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerNoLimit);
  });

  it('returns enterprise offer with less remaining balance', () => {
    const enterpriseOffers = [
      offerRemainingBalanceNoApplications,
      {
        ...offerRemainingBalanceNoApplications,
        remainingBalance: 800,
      },
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerRemainingBalanceNoApplications);
  });

  it('returns enterprise offer with less remaining applications', () => {
    const enterpriseOffers = [
      offerRemainingApplicationsNoBalance,
      {
        ...offerRemainingApplicationsNoBalance,
        remainingApplications: 50,
      },
    ];
    const result = findEnterpriseOfferForCourse({
      enterpriseOffers,
      catalogsWithCourse,
      coursePrice,
    });
    expect(result).toEqual(offerRemainingApplicationsNoBalance);
  });
});

describe('getSubsidyToApplyForCourse', () => {
  const mockApplicableSubscriptionLicense = {
    uuid: 'license-uuid',
  };

  const mockApplicableCouponCode = {
    uuid: 'coupon-code-uuid',
    usageType: 'percentage',
    benefitValue: 100,
    couponStartDate: '2023-08-11',
    couponEndDate: '2024-08-11',
    code: 'xyz',
  };

  const mockApplicableEnterpriseOffer = {
    id: 1,
    usageType: 'Percentage',
    discountValue: 100,
    startDatetime: '2023-08-11',
    endDatetime: '2024-08-11',
  };

  it('returns applicableSubscriptionLicense', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: mockApplicableSubscriptionLicense,
      applicableCouponCode: mockApplicableCouponCode,
      applicableEnterpriseOffer: mockApplicableEnterpriseOffer,
    });

    expect(subsidyToApply).toEqual({
      ...mockApplicableSubscriptionLicense,
      subsidyType: LICENSE_SUBSIDY_TYPE,
    });
  });

  it('returns applicableCouponCode if there is no applicableSubscriptionLicense', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: undefined,
      applicableCouponCode: mockApplicableCouponCode,
      applicableEnterpriseOffer: mockApplicableEnterpriseOffer,
    });

    expect(subsidyToApply).toEqual({
      discountType: mockApplicableCouponCode.usageType,
      discountValue: mockApplicableCouponCode.benefitValue,
      startDate: mockApplicableCouponCode.couponStartDate,
      endDate: mockApplicableCouponCode.couponEndDate,
      code: mockApplicableCouponCode.code,
      subsidyType: COUPON_CODE_SUBSIDY_TYPE,
    });
  });

  it('returns applicableEnterpriseOffer if there is no applicableSubscriptionLicense or applicableCouponCode', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: undefined,
      applicableCouponCode: undefined,
      applicableEnterpriseOffer: mockApplicableEnterpriseOffer,
    });

    expect(subsidyToApply).toEqual({
      discountType: mockApplicableEnterpriseOffer.usageType.toLowerCase(),
      discountValue: mockApplicableEnterpriseOffer.discountValue,
      startDate: mockApplicableEnterpriseOffer.startDatetime,
      endDate: mockApplicableEnterpriseOffer.endDatetime,
      subsidyType: ENTERPRISE_OFFER_SUBSIDY_TYPE,
    });
  });

  it('returns null if there are no applicable subsidies', () => {
    const subsidyToApply = getSubsidyToApplyForCourse({
      applicableSubscriptionLicense: undefined,
      applicableCouponCode: undefined,
      applicableEnterpriseOffer: undefined,
    });

    expect(subsidyToApply).toBeUndefined();
  });
});

describe('courseUsesEntitlementPricing', () => {
  const mockEntitlementCourse = {
    courseType: 'entitlement_course',
  };

  const mockNonEntitlementCourse = {
    courseType: 'non_entitlement_course',
  };

  it('Returns true when course type included in COURSE_TYPE_CONFIG usesEntitlementListPrice is true', () => {
    expect(courseUsesEntitlementPricing(mockEntitlementCourse)).toEqual(true);
  });

  it('Returns false when course type not included in COURSE_TYPE_CONFIG', () => {
    expect(courseUsesEntitlementPricing(mockNonEntitlementCourse)).toEqual(false);
  });
});

describe('pathContainsCourseTypeSlug', () => {
  it('returns true with matching course type slug', () => {
    expect(pathContainsCourseTypeSlug('/testenterprise/executive-education-2u/course/mock_entitlement_course', 'entitlement_course')).toEqual(true);
  });

  it('returns false without matching course type slug', () => {
    expect(pathContainsCourseTypeSlug('/testenterprise/executive-education-2u/course/mock_entitlement_course', 'non_entitlement_course')).toEqual(false);
  });
});

describe('linkToCourse', () => {
  const slug = 'testenterprise';
  const mockEntitlementCourse = {
    key: 'mock_entitlement_course',
    courseType: 'entitlement_course',
  };

  const mockNonEntitlementCourse = {
    key: 'mock_non_entitlement_course',
    courseType: 'non_entitlement_course',
  };

  const mockQueryObjectIdCourse = {
    key: 'mock_query_object_id_course',
    courseType: 'doesntmatter',
    queryId: 'testqueryid',
    objectId: 'testobjectid',
  };

  it('returns url with course type slug', () => {
    expect(linkToCourse(mockEntitlementCourse, slug)).toEqual('/testenterprise/executive-education-2u/course/mock_entitlement_course');
  });

  it('returns url without course type slug', () => {
    expect(linkToCourse(mockNonEntitlementCourse, slug)).toEqual('/testenterprise/course/mock_non_entitlement_course');
  });

  it('returns url with course queryId, objectId', () => {
    expect(linkToCourse(mockQueryObjectIdCourse, slug)).toEqual('/testenterprise/course/mock_query_object_id_course?queryId=testqueryid&objectId=testobjectid');
  });
});

describe('getAvailableCourseRuns', () => {
  const sampleCourseRunData = {
    courseData: {
      courseRuns: [
        {
          key: 'course-v1:edX+DemoX+Demo_Course',
          title: 'Demo Course',
          isMarketable: true,
          isEnrollable: true,
        },
        {
          key: 'course-v1:edX+DemoX+Demo_Course',
          title: 'Demo Course',
          isMarketable: false,
          isEnrollable: true,
        },
        {
          key: 'course-v1:edX+DemoX+Demo_Course',
          title: 'Demo Course',
          isMarketable: true,
          isEnrollable: false,
        },
        {
          key: 'course-v1:edX+DemoX+Demo_Course',
          title: 'Demo Course',
          isMarketable: false,
          isEnrollable: false,
        },
      ],
    },
  };
  it('returns object with available course runs', () => {
    for (let i = 0; i < COURSE_AVAILABILITY_MAP.length; i++) {
      sampleCourseRunData.courseData.courseRuns.forEach((courseRun) => {
        // eslint-disable-next-line no-param-reassign
        courseRun.availability = COURSE_AVAILABILITY_MAP[i];
        if (COURSE_AVAILABILITY_MAP[i] === 'Archived') {
          expect(getAvailableCourseRuns(sampleCourseRunData.courseData).length)
            .toEqual(0);
          expect(getAvailableCourseRuns(sampleCourseRunData.courseData))
            .toEqual([]);
        } else {
          expect(getAvailableCourseRuns(sampleCourseRunData.courseData).length)
            .toEqual(1);
          expect(getAvailableCourseRuns(sampleCourseRunData.courseData))
            .toEqual(sampleCourseRunData.courseData.courseRuns.slice(0, 1));
        }
      });
    }
  });
  it('returns empty array if course runs are not available', () => {
    sampleCourseRunData.courseData.courseRuns = [];
    expect(getAvailableCourseRuns(sampleCourseRunData.courseData).length).toEqual(0);
    expect(getAvailableCourseRuns(sampleCourseRunData.courseData)).toEqual([]);
  });
  it('returns an empty array is courseRuns is not defined', () => {
    sampleCourseRunData.courseData.courseRuns = undefined;
    expect(getAvailableCourseRuns(sampleCourseRunData.courseData).length).toEqual(0);
    expect(getAvailableCourseRuns(sampleCourseRunData.courseData)).toEqual([]);
  });
});
describe('getAvailableCourseRunKeysFromCourseData', () => {
  const sampleCourseDataData = {
    courseData: {
      courseDetails: {
        courseRuns: [
          {
            key: 'course-v1:edX+DemoX+Demo_Course',
            title: 'Demo Course',
            isMarketable: true,
            isEnrollable: true,
            availability: 'Current',
          },
          {
            key: 'course-v1:edX+DemoX+Demo_Course',
            title: 'Demo Course',
            isMarketable: false,
            isEnrollable: true,
            availability: 'Upcoming',
          },
          {
            key: 'course-v1:edX+DemoX+Demo_Course',
            title: 'Demo Course',
            isMarketable: true,
            isEnrollable: false,
            availability: 'Current',
          },
          {
            key: 'course-v1:edX+DemoX+Demo_Course',
            title: 'Demo Course',
            isMarketable: false,
            isEnrollable: false,
            availability: 'Archived',
          },
        ],
      },
    },
  };
  it('returns array with available course run keys', () => {
    const output = getAvailableCourseRunKeysFromCourseData(sampleCourseDataData.courseData);
    expect(output.length).toEqual(1);
    expect(output).toEqual(['course-v1:edX+DemoX+Demo_Course']);
  });
  it('returns empty array if course runs are not available', () => {
    sampleCourseDataData.courseData.courseDetails = [];
    const output = getAvailableCourseRunKeysFromCourseData(sampleCourseDataData.courseData);
    expect(output.length).toEqual(0);
    expect(output).toEqual([]);
  });
});

describe('getCourseStartDate tests', () => {
  it('Validate additionalMetadata gets priority in course start date calculation', async () => {
    const mockAdditionalMetadataStartDate = '2023-06-10T12:00:00Z';
    const startDate = getCourseStartDate({
      contentMetadata: {
        additionalMetadata: {
          startDate: mockAdditionalMetadataStartDate,
        },
        courseType: 'executive-education-2u',
      },
      courseRun: {
        start: '2022-03-08T12:00:00Z',
      },
    });
    expect(startDate).toMatch(mockAdditionalMetadataStartDate);
  });

  it('Validate active course run\'s start date is used when additionalMetadata is null.', async () => {
    const mockCourseRuStartDate = '2022-03-08T12:00:00Z';
    const startDate = getCourseStartDate({
      contentMetadata: {
        additionalMetadata: null,
        courseType: 'executive-education-2u',
      },
      courseRun: {
        start: mockCourseRuStartDate,
      },
    });
    expect(startDate).toMatch(mockCourseRuStartDate);
  });

  it('Validate getCourseDate handles empty data for course run and course metadata.', async () => {
    const startDate = getCourseStartDate(
      { contentMetadata: null, courseRun: null },
    );
    expect(startDate).toBe(undefined);
  });
});

describe('getMissingSubsidyReasonActions', () => {
  it.each([
    DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_SPEND_REACHED,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_MAX_ENROLLMENTS_REACHED,
  ])('returns "Learn about limits" CTA when `reasonType` is: %s', (reasonType) => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType,
      enterpriseAdminUsers: [],
    });
    render(ActionsComponent);
    const ctaBtn = screen.getByText('Learn about limits');
    expect(ctaBtn).toBeInTheDocument();
    expect(ctaBtn.getAttribute('href')).toEqual('https://limits.url');
  });

  it(`returns "Learn about deactivation" CTA when \`reasonType\` is: ${DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED}`, () => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED,
      enterpriseAdminUsers: [],
    });
    render(ActionsComponent);
    const ctaBtn = screen.getByText('Learn about deactivation');
    expect(ctaBtn).toBeInTheDocument();
    expect(ctaBtn.getAttribute('href')).toEqual('https://deactivation.url');
  });

  it.each([
    DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.POLICY_NOT_ACTIVE,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_NOT_IN_ENTERPRISE,
    DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
    DISABLED_ENROLL_REASON_TYPES.NOT_ENOUGH_VALUE_IN_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
  ])('returns "Contact administrator" CTA when `reasonType` is: %s', (reasonType) => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType,
      enterpriseAdminUsers: [{ email: 'admin@example.com' }],
    });
    render(ActionsComponent);
    const ctaBtn = screen.getByText('Contact administrator');
    expect(ctaBtn).toBeInTheDocument();
    expect(ctaBtn.getAttribute('href')).toEqual('mailto:admin@example.com');
  });

  it.each([
    DISABLED_ENROLL_REASON_TYPES.NO_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.POLICY_NOT_ACTIVE,
    DISABLED_ENROLL_REASON_TYPES.LEARNER_NOT_IN_ENTERPRISE,
    DISABLED_ENROLL_REASON_TYPES.CONTENT_NOT_IN_CATALOG,
    DISABLED_ENROLL_REASON_TYPES.NOT_ENOUGH_VALUE_IN_SUBSIDY,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED,
    DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
  ])('returns no "Contact administrator" CTA when `reasonType` is %s and there are no enterprise admins', (reasonType) => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType,
      enterpriseAdminUsers: [],
    });
    const { container } = render(ActionsComponent);
    expect(container).toBeEmptyDOMElement();
  });

  it('returns no CTA when `reasonType` is unsupported', () => {
    const ActionsComponent = getMissingSubsidyReasonActions({
      reasonType: 'invalid',
      enterpriseAdminUsers: [],
    });
    const { container } = render(ActionsComponent);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('getSubscriptionDisabledEnrollmentReasonType', () => {
  const mockCatalogUuid = 'test-catalog-uuid';

  it.each([
    {
      daysUntilExpirationIncludingRenewals: [-17],
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      daysUntilExpirationIncludingRenewals: [-17],
      hasEnterpriseAdminUsers: false,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_EXPIRED_NO_ADMINS,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      daysUntilExpirationIncludingRenewals: [-17],
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: ['fake-catalog-uuid'],
    },
    {
      daysUntilExpirationIncludingRenewals: [0],
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      daysUntilExpirationIncludingRenewals: [10],
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      daysUntilExpirationIncludingRenewals: [-17, 10],
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: [mockCatalogUuid],
    },
  ])('handles expired subscription: %s', ({
    daysUntilExpirationIncludingRenewals,
    hasEnterpriseAdminUsers,
    expectedReasonType,
    catalogsWithCourse,
  }) => {
    const subscriptions = [];
    daysUntilExpirationIncludingRenewals.forEach((days) => {
      subscriptions.push({
        enterpriseCatalogUuid: mockCatalogUuid,
        daysUntilExpirationIncludingRenewals: days,
      });
    });
    const customerAgreementConfig = { subscriptions };
    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreementConfig,
      catalogsWithCourse,
      subscriptionLicense: undefined,
      hasEnterpriseAdminUsers,
    });
    expect(reasonType).toEqual(expectedReasonType);
  });

  it.each([
    {
      unassignedLicensesCount: [0],
      daysUntilExpirationIncludingRenewals: [10],
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      unassignedLicensesCount: [0],
      daysUntilExpirationIncludingRenewals: [10],
      hasEnterpriseAdminUsers: false,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED_NO_ADMINS,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      unassignedLicensesCount: [0],
      daysUntilExpirationIncludingRenewals: [10],
      hasEnterpriseAdminUsers: false,
      expectedReasonType: undefined,
      catalogsWithCourse: ['fake-catalog-uuid'],
    },
    {
      unassignedLicensesCount: [167, 0],
      daysUntilExpirationIncludingRenewals: [-17, 10],
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_SEATS_EXHAUSTED,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      unassignedLicensesCount: [1],
      daysUntilExpirationIncludingRenewals: [10],
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
      catalogsWithCourse: [mockCatalogUuid],
    },
  ])('handles exhausted subscription: %s', ({
    unassignedLicensesCount,
    daysUntilExpirationIncludingRenewals,
    hasEnterpriseAdminUsers,
    expectedReasonType,
    catalogsWithCourse,
  }) => {
    const subscriptions = [];
    daysUntilExpirationIncludingRenewals.forEach((days, index) => {
      subscriptions.push({
        enterpriseCatalogUuid: mockCatalogUuid,
        daysUntilExpirationIncludingRenewals: days,
        licenses: {
          unassigned: unassignedLicensesCount[index],
        },
      });
    });
    const customerAgreementConfig = { subscriptions };

    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreementConfig,
      catalogsWithCourse,
      subscriptionLicense: undefined,
      hasEnterpriseAdminUsers,
    });
    expect(reasonType).toEqual(expectedReasonType);
  });

  it.each([
    {
      subscriptionLicense: { status: 'revoked' },
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_DEACTIVATED,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      subscriptionLicense: { status: 'activated' },
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: [mockCatalogUuid],
    },
  ])('handles revoked/deactivated subscription license', ({
    subscriptionLicense,
    hasEnterpriseAdminUsers,
    expectedReasonType,
    catalogsWithCourse,
  }) => {
    const customerAgreementConfig = {
      subscriptions: [
        {
          enterpriseCatalogUuid: mockCatalogUuid,
          daysUntilExpirationIncludingRenewals: 10,
        },
      ],
    };

    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreementConfig,
      catalogsWithCourse,
      subscriptionLicense,
      hasEnterpriseAdminUsers,
    });
    expect(reasonType).toEqual(expectedReasonType);
  });

  it.each([
    {
      daysUntilExpirationIncludingRenewals: 10,
      unassignedLicensesCount: 50,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      daysUntilExpirationIncludingRenewals: 10,
      unassignedLicensesCount: 50,
      hasEnterpriseAdminUsers: false,
      expectedReasonType: DISABLED_ENROLL_REASON_TYPES.SUBSCRIPTION_LICENSE_NOT_ASSIGNED_NO_ADMINS,
      catalogsWithCourse: [mockCatalogUuid],
    },
    {
      daysUntilExpirationIncludingRenewals: 10,
      unassignedLicensesCount: 50,
      hasEnterpriseAdminUsers: true,
      expectedReasonType: undefined,
      catalogsWithCourse: ['fake-catalog-uuid'],
    },
  ])('handles no subscription license with remaining seats: %s', ({
    daysUntilExpirationIncludingRenewals,
    unassignedLicensesCount,
    hasEnterpriseAdminUsers,
    expectedReasonType,
    catalogsWithCourse,
  }) => {
    const customerAgreementConfig = {
      subscriptions: [
        {
          enterpriseCatalogUuid: mockCatalogUuid,
          daysUntilExpirationIncludingRenewals,
          licenses: {
            unassigned: unassignedLicensesCount,
          },
        },
      ],
    };

    const reasonType = getSubscriptionDisabledEnrollmentReasonType({
      customerAgreementConfig,
      catalogsWithCourse,
      subscriptionLicense: undefined,
      hasEnterpriseAdminUsers,
    });
    expect(reasonType).toEqual(expectedReasonType);
  });
});

describe('isActiveSubscriptionLicense', () => {
  it.each([
    {
      subscriptionLicense: { status: 'activated' },
      expectedResult: true,
    },
    {
      subscriptionLicense: { status: 'revoked' },
      expectedResult: false,
    },
    {
      subscriptionLicense: { status: 'assigned' },
      expectedResult: false,
    },
    {
      subscriptionLicense: undefined,
      expectedResult: false,
    },
  ])('returns expected value given the following inputs: %s', ({ subscriptionLicense, expectedResult }) => {
    const isActive = isActiveSubscriptionLicense(subscriptionLicense);
    expect(isActive).toEqual(expectedResult);
  });
});
