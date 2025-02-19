import React, { useMemo, useState } from 'react';

import PropTypes from 'prop-types';
import {
  Card,
  Button,
  useToggle,
} from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import algoliasearch from 'algoliasearch/lite';
import LevelBars from './LevelBars';
import SkillsRecommendationCourses from './SkillsRecommendationCourses';

const CategoryCard = ({ topCategory }) => {
  const { skillsSubcategories } = topCategory;
  const [subcategory, setSubcategory] = useState(null);
  const [subcategorySkills, setSubcategorySkills] = useState(null);
  const [subCategoryName, setSubCategoryName] = useState(null);
  const [subCategorySkillsLength, setSubCategorySkillsLength] = useState(null);
  const [showSkills, setShowSkillsOn, , toggleShowSkills] = useToggle(false);
  const [showAll, setShowAllOn, setShowAllOff, toggleShowAll] = useToggle(false);
  const [showLess, , setShowLessOff, toggleShowLess] = useToggle(false);

  const config = getConfig();
  const courseIndex = useMemo(
    () => {
      const client = algoliasearch(
        config.ALGOLIA_APP_ID,
        config.ALGOLIA_SEARCH_API_KEY,
      );
      return client.initIndex(config.ALGOLIA_INDEX_NAME);
    },
    [config.ALGOLIA_APP_ID, config.ALGOLIA_INDEX_NAME, config.ALGOLIA_SEARCH_API_KEY],
  );

  const filterRenderableSkills = (skills) => {
    const renderableSkills = [];
    for (let i = 0; i < skills.length; i += 1) {
      renderableSkills.push(skills[i]);
    }
    return renderableSkills;
  };

  const handleSubcategoryClick = (skillsSubcategory) => {
    if (subCategoryName === skillsSubcategory.name) {
      // Hide the subcategory skills list
      toggleShowSkills();
    } else {
      // Show the subcategory skills for another subcategory
      setShowSkillsOn();
    }
    if (showSkills) {
      setShowAllOff();
      setShowLessOff();
    } else {
      setShowAllOn();
    }
    setSubCategoryName(skillsSubcategory.name);
    setSubcategory(skillsSubcategory);
    setSubCategorySkillsLength(skillsSubcategory.skills.length);
    setSubcategorySkills(skillsSubcategory.skills.slice(0, 3));

    setSubCategoryName(skillsSubcategory.name);
    setSubcategory(skillsSubcategory);
    const renderableSkills = filterRenderableSkills(skillsSubcategory.skills);
    setSubCategorySkillsLength(renderableSkills.length);
    setSubcategorySkills(renderableSkills.slice(0, 3));
  };

  const handleShowAllClick = () => {
    toggleShowAll();
    toggleShowLess();
    const renderableSkills = filterRenderableSkills(subcategory.skills);
    if (showAll === true) {
      setSubcategorySkills(renderableSkills);
    } else {
      setSubcategorySkills(renderableSkills.slice(0, 3));
    }
  };

  const renderSkillsWithLevelsChunk = (renderableSkills) => {
    const skills = [];
    for (let i = 0; i < renderableSkills.length; i += 3) {
      skills.push(
        <div className="skill-level-details-row">
          {renderableSkills.slice(i, i + 3).map((skill) => (
            <div className="skill-detail" data-testid="skill-name">
              <LevelBars skillLevel={skill.score ? skill.score : 0} />
              {skill.name}
            </div>
          ))}
        </div>,
      );
    }
    return skills;
  };

  return (
    <Card className="mb-4.5">
      <Card.Header className="mt-n3" title={topCategory.name} />
      <Card.Section>
        {skillsSubcategories.map((skillsSubcategory) => (
          <Button
            variant="light"
            size="sm"
            className="mr-1 mb-1"
            data-testid="skill-category-chip"
            onClick={() => handleSubcategoryClick(skillsSubcategory)}
          >
            {skillsSubcategory.name}
          </Button>
        ))}
      </Card.Section>
      {subcategorySkills && showSkills && (
        <Card.Section className="mt-n3">
          <div>
            <h5>{subCategoryName} Skills</h5>
          </div>
          <div>
            {renderSkillsWithLevelsChunk(subcategorySkills)}
          </div>
        </Card.Section>
      )}
      {subcategorySkills && subCategorySkillsLength > 3 && (
        <Button
          variant="link"
          className="mb-1 mt-n4 justify-content-end"
          onClick={() => {
            handleShowAllClick();
          }}
          testid="show-all-less-button"
        >
          {showAll && !showLess && (
            <span>Show ({subCategorySkillsLength}) &gt;</span>
          )}
          {!showAll && showLess && (
            <span>Show Less</span>
          )}
          {
            !showAll && !showLess && (
              null)
          }
        </Button>
      )}
      <Card.Section>
        {showSkills && subcategorySkills && (
          <div className="skill-details-recommended-courses">
            <SkillsRecommendationCourses
              index={courseIndex}
              subCategoryName={subCategoryName}
              subCategorySkills={subcategorySkills.map((skill) => skill.name)}
            />
          </div>
        )}
      </Card.Section>
    </Card>
  );
};

CategoryCard.propTypes = {
  topCategory: PropTypes.shape({
    name: PropTypes.string.isRequired,
    skillsSubcategories: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        skills: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
          }),
        ).isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

export default CategoryCard;
