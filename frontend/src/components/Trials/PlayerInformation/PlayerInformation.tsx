import {Divider, Paper, Stack, TextField, Typography} from "@mui/material";
import React, {FC} from "react";
import TutorialTip from "../../Tutorial/TutorialTip";
import styled from "@emotion/styled";

interface PlayerInformationProps {
    /** Player's ID */
    id: number;
    step: number;
    cumulativePoints: number;
    totalScore: number;
    /** Player's comment */
    comment?: string;
    showComment?: boolean;
    /** show tutorial tip */
    showTutorialScore?: boolean;
    showTutorialComment?: boolean;
    /** Callback to handle tutorial tip close */
    onTutorialCommentClose?: () => void;
    playerScore?: number | null;
}

const Item = styled(Paper)(() => ({
    padding: 2,
    elevation: 0,
    textAlign: 'left',
}));

const PlayerInfoItem: FC = ({children}) => {
    return (
        <Item elevation={0}>
            {children}
            {/*<Divider/>*/}
        </Item>
    )
};


export const PlayerInformation: FC<PlayerInformationProps> = (props) => {
    const {showComment = true, showTutorialScore = false, showTutorialComment = false, playerScore = null} = props;
    return (

        <Stack spacing={1} sx={{paddingTop: "20px"}}>
            <Typography gutterBottom variant="h4" component="div">
                Points
            </Typography>
            <PlayerInfoItem>
                <TutorialTip
                    tutorialId={"practice_step_score"}
                    isTutorial={showTutorialScore}
                    isShowTip={false}
                    onTutorialClose={() => {}}
                >
                    <Typography variant="h6" component="div">
                        Current Network: {props.cumulativePoints}
                    </Typography>
                </TutorialTip>
            </PlayerInfoItem>
            <PlayerInfoItem>
                <Typography variant="h6" component="div">
                    Total: {props.totalScore}
                </Typography>
            </PlayerInfoItem>
            {(showComment) ? (
                <PlayerInfoItem>
                    <Typography gutterBottom variant="h6" component="div">
                        Player {props.id} comment:
                    </Typography>

                    <TutorialTip
                        tutorialId={"social_learning_observation_comment"}
                        isTutorial={showTutorialComment}
                        isShowTip={false}
                        onTutorialClose={props.onTutorialCommentClose}
                        placement={"right"}
                    >
                        <TextField
                            id="outlined-multiline-static"
                            // label=""
                            multiline
                            fullWidth
                            rows={10}
                            InputProps={{readOnly: true}}
                            defaultValue={props.comment ? props.comment : "No comment"}
                        />
                    </TutorialTip>
                </PlayerInfoItem>
            ) : null}
            {playerScore !== null &&
                <PlayerInfoItem>
                    <Typography gutterBottom variant="h6" component="div">
                        Player {props.id} score: {playerScore}
                    </Typography>
                </PlayerInfoItem>
            }

        </Stack>

    )
}

export default PlayerInformation;