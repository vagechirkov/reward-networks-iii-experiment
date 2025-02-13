import React, {createContext, FC, useContext, useEffect, useReducer} from "react";
import {
    StaticNetworkEdgeInterface,
    StaticNetworkNodeInterface
} from "../components/Network/StaticNetwork/StaticNetwork";
import networkReducer from "../reducers/NetworkReducer";

const LOCAL_STORAGE_NETWORK_STATE_KEY = 'networkState';


type timerState = {
    timePassed: number;
    isTimerPaused: boolean;
    isTimerDone: boolean;

}


export type NetworkState = {
    network: { edges: StaticNetworkEdgeInterface[], nodes: StaticNetworkNodeInterface[] } | undefined;
    step: number;
    points: number;
    moves: number[];
    timer: timerState;
    currentNode: number;
    possibleMoves: number[];
    isNetworkDisabled: boolean;
    isNetworkFinished: boolean;
    isPractice: boolean;
    tutorialStep: number;
    tutorialOptions: {
        node: boolean;
        edge: boolean,
        points: boolean,
        linearSolution: boolean,
        time: boolean,
        totalScore: boolean,
        comment: boolean,
    };
    teacherComment: string;
    currentReward?: number;
}

export type NetworkContextType = {
    networkState: NetworkState | null;
    networkDispatcher: (action: any) => void;
};


const NetworkContext = createContext<NetworkContextType | null>(null);

export const networkInitialState: NetworkState = {
    step: 0,
    points: 0,
    moves: [],
    timer: {
        timePassed: 0,
        isTimerPaused: false,
        isTimerDone: false,
    },
    currentNode: undefined,
    possibleMoves: undefined,
    isNetworkDisabled: false,
    network: undefined,
    isNetworkFinished: false,
    isPractice: false,
    tutorialStep: 0,
    tutorialOptions: {
        node: false,
        edge: false,
        points: false,
        linearSolution: false,
        time: false,
        totalScore: false,
        comment: false,
    },
    teacherComment: '',
    currentReward: undefined,
}

const networkInitializer = (initialState: NetworkState) => {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_NETWORK_STATE_KEY)) || initialState;
}

interface INetworkContextProvider {
    children: any;
    saveToLocalStorage?: boolean;
}

export const NetworkContextProvider: FC<INetworkContextProvider> = (props) => {
    const {children, saveToLocalStorage=true} = props;
    const [state, dispatch] = useReducer(networkReducer, networkInitialState, networkInitializer);

    useEffect(() => {
        if(saveToLocalStorage)
            localStorage.setItem(LOCAL_STORAGE_NETWORK_STATE_KEY, JSON.stringify(state));
    }, [state]);

    return (
        <NetworkContext.Provider value={{networkState: state, networkDispatcher: dispatch}}>
            {children}
        </NetworkContext.Provider>
    );
};


const useNetworkContext = () => useContext(NetworkContext);

export default useNetworkContext;