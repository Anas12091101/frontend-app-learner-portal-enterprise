import React from 'react';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ProgramProgressCircle from '../ProgramProgressCircle';
import { ProgramProgressContext } from '../ProgramProgressContextProvider';
import {
  X_AXIS, Y_AXIS, CIRCLE_RADIUS, STROKE_WIDTH, CIRCLE_LABEL,
} from '../data/constants';

const ProgramProgressCircleWithContext = ({
  initialProgramProgressContext = {},
}) => (
  <ProgramProgressContext.Provider value={initialProgramProgressContext}>
    <ProgramProgressCircle />
  </ProgramProgressContext.Provider>
);

const testProgramData = {
  type: 'MicroMasters',
};

const testCourseData = {
  inProgress: [{ key: 'course-1' }, { key: 'course-2' }],
  completed: [{ key: 'course-3' }],
  notStarted: [],
};

describe('<ProgramProgressCircle />', () => {
  it('renders program progress circle with correct data', () => {
    const initialProgramProgressContext = {
      programData: testProgramData,
      courseData: testCourseData,
    };
    const { container } = render(
      <ProgramProgressCircleWithContext
        initialProgramProgressContext={initialProgramProgressContext}
      />,
    );
    expect(screen.getByText(`${testProgramData.type} Progress`)).toBeInTheDocument();
    expect(container.querySelector('[data-testid="svg-circle"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="svg-circle"]')).toHaveClass('progress-circle');
    // Test background circle is present with the given attributes
    const backgroundCircle = container.querySelector('.bg');
    expect(backgroundCircle).toHaveAttribute('r', CIRCLE_RADIUS.toString());
    expect(backgroundCircle).toHaveAttribute('cx', X_AXIS.toString());
    expect(backgroundCircle).toHaveAttribute('cy', Y_AXIS.toString());
    expect(backgroundCircle).toHaveAttribute('stroke-width', STROKE_WIDTH.toString());
    // Test circle segments
    const totalCourse = testCourseData.inProgress.length + testCourseData.completed.length + testCourseData.notStarted;
    const circleSegments = screen.queryAllByTestId('circle-segment');
    expect(circleSegments.length).toEqual(parseInt(totalCourse, 10));
    // Test circle segments have given attributes
    circleSegments.forEach(segment => {
      expect(segment).toHaveAttribute('r', CIRCLE_RADIUS.toString());
      expect(segment).toHaveAttribute('cx', X_AXIS.toString());
      expect(segment).toHaveAttribute('cy', Y_AXIS.toString());
      expect(segment).toHaveAttribute('stroke-width', STROKE_WIDTH.toString());
      expect(segment).toHaveAttribute('stroke-dasharray');
      expect(segment).toHaveAttribute('stroke-dashoffset');
    });
    // Test circle label
    expect(screen.getByText(CIRCLE_LABEL)).toBeInTheDocument();
    expect(container.querySelector('span.complete')).toHaveTextContent(testCourseData.completed.length);
    expect(container.querySelector('span.total')).toHaveTextContent(totalCourse);
  });
});
