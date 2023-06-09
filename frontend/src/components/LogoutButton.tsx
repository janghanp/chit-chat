import { Dispatch, SetStateAction, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineLogout } from 'react-icons/hi';
import { useQueryClient } from '@tanstack/react-query';

import { socket } from '../socket';
import useLogout from '../hooks/useLogout';

interface Props {
    setIsDropdownOpen: Dispatch<SetStateAction<boolean>>;
}

const LogoutButton = ({ setIsDropdownOpen }: Props) => {
    const queryClient = useQueryClient();
    const { mutate: logout } = useLogout();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleLogout = () => {
        logout();
        queryClient.removeQueries({ queryKey: ['currentUser'], exact: true });

        socket.disconnect();
    };

    return (
        <>
            <button
                className="flex text-red-600"
                onClick={() => {
                    setIsOpen(true);
                }}
            >
                <HiOutlineLogout className="text-xl" />
                <span className="ml-3">Logout</span>
            </button>
            {isOpen &&
                createPortal(
                    <div className="fixed inset-0 z-40 flex items-center justify-center">
                        <div
                            className="fixed inset-0 bg-gray-500/50"
                            onClick={() => {
                                setIsDropdownOpen(false);
                                setIsOpen(false);
                            }}
                        ></div>
                        <div className="z-40 w-[400px] rounded-lg bg-white p-7 shadow-md">
                            <h3 className="text-xl font-bold">Log out</h3>
                            <p className="py-4">Are you sure you want to log out?</p>
                            <div className="flex flex-row items-center justify-end gap-x-5">
                                <label
                                    className="btn-ghost btn-md btn"
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsOpen(false);
                                    }}
                                >
                                    cancel
                                </label>
                                <label className="btn-error btn-md btn" onClick={handleLogout}>
                                    Log Out
                                </label>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};

export default LogoutButton;
