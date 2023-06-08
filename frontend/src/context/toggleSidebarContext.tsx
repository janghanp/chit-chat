import { ReactNode, createContext, useContext } from 'react';

const defaultValue = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    toggleSidebar: () => {},
};

const toggleSidebarContext = createContext(defaultValue);

interface Props {
    children: ReactNode;
}

export function ToggleSidebarProvider({ children }: Props) {
    const toggleSidebar = () => {
        const sideBar = document.getElementById('side-bar');

        if (sideBar?.className.includes('open')) {
            sideBar?.classList.add('close');
            sideBar?.classList.remove('open');
        } else {
            sideBar?.classList.add('open');
            sideBar?.classList.remove('close');
        }
    };
    return (
        <toggleSidebarContext.Provider value={{ toggleSidebar }}>
            {children}
        </toggleSidebarContext.Provider>
    );
}

export function useToggleSidebarContext() {
    return useContext(toggleSidebarContext);
}
