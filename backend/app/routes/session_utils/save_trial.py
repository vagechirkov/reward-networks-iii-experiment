from datetime import datetime
from typing import List

from beanie import PydanticObjectId

from models.session import Session
from models.trial import Trial, Solution, TrialError, WrittenStrategy, \
    Advisor, PostSurvey
from utils.utils import estimate_solution_score


async def save_trial(body, session, trial, trial_type):
    # save trial results
    if trial_type == 'individual':
        save_individual_demonstration_trial(trial, body)
    elif trial_type == 'social_learning_selection':
        # select all social learning trials for one advisor
        sl_start = session.current_trial_num
        sl_end = 1
        for t in session.trials[sl_start + 1:]:
            if t.trial_type in ['social_learning_selection', 'individual']:
                break
            sl_end += 1
        trials = session.trials[sl_start:sl_start + sl_end]
        await save_social_learning_selection(trials, session.subject_id, body)
        session.trials[sl_start:sl_start + sl_end] = trials
    elif trial_type == 'observation':
        save_individual_demonstration_trial(trial, body)
    elif trial_type == 'repeat':
        save_individual_demonstration_trial(trial, body)
    elif trial_type == 'try_yourself':
        save_individual_demonstration_trial(trial, body)
    elif trial_type == 'demonstration':
        save_individual_demonstration_trial(trial, body)
    elif trial_type == 'written_strategy':
        save_written_strategy(trial, body)
    elif trial_type == 'post_survey':
        save_survey_trial(trial, body)
    elif trial_type in ['consent', 'practice', 'debriefing', 'instruction']:
        save_empty_trial(trial)

    # update session with the trial
    session.trials[session.current_trial_num] = trial


def save_individual_demonstration_trial(trial: Trial, body: Solution):
    if not isinstance(body, Solution):
        return TrialError(message='Trial results are missing')

    trial.solution = Solution(
        moves=body.moves,
        score=estimate_solution_score(trial.network, body.moves),
        trial_id=trial.id,
        finished_at=datetime.now()
    )
    trial.finished_at = datetime.now()
    trial.finished = True


def save_written_strategy(trial: Trial, body: WrittenStrategy):
    if not isinstance(body, WrittenStrategy):
        return TrialError(message='Trial results are missing')

    trial.written_strategy = WrittenStrategy(
        strategy=body.strategy,
        trial_id=trial.id,
        finished_at=datetime.now()
    )
    trial.finished_at = datetime.now()
    trial.finished = True


def save_survey_trial(trial: Trial, body: PostSurvey):
    if not isinstance(body, PostSurvey):
        return TrialError(message='Trial results are missing')

    trial.post_survey = PostSurvey(
        questions=body.questions,
        trial_id=trial.id,
        finished_at=datetime.now()
    )
    trial.finished_at = datetime.now()
    trial.finished = True


async def save_social_learning_selection(trials: List[Trial],
                                         subject_id: PydanticObjectId,
                                         body: Advisor):
    if not isinstance(body, Advisor):
        return TrialError(message='Trial results are missing')

    sl_selection = trials[0]
    sl_trials = trials[1:]

    # remove instruction trial if it is in the list of social learning trials
    sl_trials = [t for t in sl_trials if t.trial_type != 'instruction']

    # get advisor session
    ad_s = await Session.get(body.advisor_id)

    if ad_s is None:
        return TrialError(message='Advisor session is not found')

    # get advisor demonstration trials
    ad_trials = [t for t in ad_s.trials if t.trial_type == 'demonstration']

    # TODO: remove this after pilot 4B !!!
    # ----------------- Relevant for pilot 2B and 4B -----------------
    # sl_selection.id == 8 is the first social learning selection trial
    if sl_selection.id == 8 and ad_trials[0].solution.solution_type == "myopic":
        comment = "Always follow the green arrows"
    elif sl_selection.id == 8 and ad_trials[0].solution.solution_type == "loss":
        comment = "I tried many different things. It turned out that the best strategy is to take exactly three " \
                  "violet arrows as early as possible and to go for dark green arrows afterwards. Do not take a dark " \
                  "green arrow before taking at least three violet arrows first"
    elif sl_selection.id == 16 and ad_trials[0].solution.solution_type == "myopic":
        comment = "Try to maximize green, especially dark green"
    # elif sl_selection.id == 16 and ad_trials[0].solution.solution_type == "loss":
    else:
        comment = "To be able to get to the arrows with 400 points you first need to take exactly three arrows with " \
                  "-50 points. Do it as early as possible"
    # ---------------------------------------------------------

    # select advisor's written strategy
    wr_s = [t.written_strategy for t in ad_s.trials if
            t.trial_type == 'written_strategy'][0]

    # iterate over advisor's demonstration trials
    for n, t in enumerate(ad_trials):
        # update `selected_by_children` field for advisor's demonstration trial
        t.selected_by_children.append(subject_id)

        # iterate over social learning trials (observation, repeat, tryyourself)
        for i in range(3):
            # NOTE: trials size should be 3 x len(ad_trials)
            sl_trials[n * 3 + i].advisor = Advisor(
                advisor_id=body.advisor_id,
                solution=t.solution,
                # written_strategy=wr_s.strategy
                # TODO: remove this after pilot 2B !!!
                # ----------------- Relevant for pilot 2B -----------------
                written_strategy=comment
                # ---------------------------------------------------------
            )
            # assign advisor's network to the trial
            sl_trials[n * 3 + i].network = t.network

    sl_selection.advisor = Advisor(
        advisor_id=body.advisor_id,
        written_strategy=wr_s.strategy
    )

    sl_selection.finished_at = datetime.now()
    sl_selection.finished = True


def save_empty_trial(trial: Trial):
    trial.finished_at = datetime.now()
    trial.finished = True
