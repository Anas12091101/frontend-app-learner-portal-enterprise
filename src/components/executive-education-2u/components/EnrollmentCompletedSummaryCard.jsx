import React, { useContext } from 'react';
import {
  Card, Col, Hyperlink, Row,
} from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { AppContext } from '@edx/frontend-platform/react';
import GetSmarterLogo from '../../../assets/icons/get-smarter-logo-black.svg';

const EnrollmentCompletedSummaryCard = () => {
  const config = getConfig();
  const {
    enterpriseConfig: { authOrgId },
  } = useContext(AppContext);

  const externalDashboardQueryParams = new URLSearchParams({
    org_id: authOrgId,
  });
  const externalDashboardQueryString = externalDashboardQueryParams ? `?${externalDashboardQueryParams.toString()}` : '';
  const externalDashboardUrl = `${config.GETSMARTER_LEARNER_DASHBOARD_URL}${externalDashboardQueryString ?? ''}`;

  return (
    <Card className="bg-light-500">
      <Row className="my-3">
        <Col xs={12} md={3}>
          <Card.Section>
            <img
              className="d-block"
              src={GetSmarterLogo}
              alt="partner-header-logo"
              data-testid="partner-header-logo-image-id"
            />
          </Card.Section>
        </Col>
        <Col xs={12} md={9}>
          <Card.Section>
            <div className="h3 mb-4">What happens next?</div>
            <div className="mb-3.5">
              <div className="mb-1.5 text-black-color">Notified by email</div>
              <div className="small mb-2 text-gray-500">
                GetSmarter will email you when your course starts. Alternatively, you can visit your{' '}
                <Hyperlink
                  destination={externalDashboardUrl}
                  target="_blank"
                >
                  GetSmarter learner dashboard
                </Hyperlink>
                {' '}for course status updates.
              </div>
            </div>
            <div className="mb-3.5">
              <div className="mb-1.5 text-black-color">Read the refund policy</div>
              <div className="small text-gray-500">
                As part of our commitment to your professional development, you may request to change
                your course start date or request your money back if you&apos;re not fully satisfied with
                14 calendar days of your course start date.
              </div>
              <div className="small mb-2 text-gray-500">
                Read GetSmarter&apos;s{' '}
                <Hyperlink
                  destination={config.GETSMARTER_STUDENT_TC_URL}
                  target="_blank"
                >
                  Terms and Conditions
                </Hyperlink>
                &nbsp;for the full course postponement and cancellation policy.
              </div>
            </div>
          </Card.Section>
        </Col>
      </Row>
    </Card>
  );
};

export default EnrollmentCompletedSummaryCard;
