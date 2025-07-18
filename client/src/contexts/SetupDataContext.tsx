//
// Context to ensure navbar to get setupData, so as to do the api cleanup.
//

"use client";

import { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { SetupData } from "@/data/types/setup";

const SetupDataContext = createContext<{
    setupData: SetupData | null;
    setSetupData: (data: SetupData | null) => void;
}>({ setupData: null, setSetupData: () => {} });

export const useSetupDataContext = () => useContext(SetupDataContext);

export const SetupDataProvider = ({ children }: { children: ReactNode }) => {
    const [setupData, setSetupData] = useState<SetupData | null>(null);
    return (
        <SetupDataContext.Provider value={{ setupData, setSetupData }}>
            {children}
        </SetupDataContext.Provider>
    );
};