import { Helmet } from "react-helmet";
import { SKILL_BUILDER_TITLE, text, webTechBootCamps } from "./constants";
import SkillBuilderForm from "./SkillBuilderForm";
import "./styles/index.scss";
import StickyHeader from "./StickyHeader";
import ProgramCard from "../cards/ProgramCard";

const SkillBuilderPage = () => {
  const TITLE = `edx - ${SKILL_BUILDER_TITLE}`;
  return (
    <>
      <Helmet title={TITLE} />
      <StickyHeader />
      <div className="page-body">
        <div className="text">
          <p className="text-gray-600 text-justify">{text}</p>
        </div>
        <SkillBuilderForm />
        <div className="cards-display">
          <p className="pgn__form-label">
            Boot camps for a web technology specialist
          </p>
          <div className="card-container">
            {webTechBootCamps.map((bootcamp) => (
              <ProgramCard {...bootcamp} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
export default SkillBuilderPage;
