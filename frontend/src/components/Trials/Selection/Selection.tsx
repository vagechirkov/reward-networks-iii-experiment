import React from "react";
import SelectionOneCard from "./SelectionOneCard";
import {Grid, Typography} from "@mui/material";
import {AdvisorSelection} from "../../../apis/apiTypes";


interface SocialLearningSelectionProps {
    advisors: AdvisorSelection;
    onAdvisorSelected: (advisorId: string, inx: number) => void;
    ownScore: number;
    /** show tutorial tip */
    showTutorial?: boolean;
}

const Selection: React.FC<SocialLearningSelectionProps> = (props) => {
    const {advisors, onAdvisorSelected, ownScore, showTutorial = false} = props;
    const [tutorialInx, setTutorialInx] = React.useState(1);

    return (
        <>
            <Typography variant="h3" align='center'>
                Select a player to learn from
            </Typography>
            <Typography variant="h3" align='center'>
                Your Score:  {ownScore}
            </Typography>
            <Grid sx={{flexGrow: 1}} container spacing={8} justifyContent="center">
                {
                    advisors.scores.map((score, inx) => {
                        return (
                            <Grid item key={inx}>
                                <SelectionOneCard
                                    personInx={inx + 1}
                                    averageScore={score}
                                    onClickHandler={() => onAdvisorSelected(advisors.advisor_ids[inx], inx + 1)}
                                    showTutorial={showTutorial && inx === 1}
                                    onTutorialClose={() => setTutorialInx(tutorialInx + 1)}
                                    disabled={showTutorial && tutorialInx === 1}
                                />
                            </Grid>
                        )
                    })
                }
            </ Grid>
        </>
    );
};


export default Selection;