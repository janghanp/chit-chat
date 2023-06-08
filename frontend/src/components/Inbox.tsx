import { Fragment, useEffect, useState } from 'react';
import { HiX } from 'react-icons/hi';
import { HiBell } from 'react-icons/hi2';
import { SyncLoader } from 'react-spinners';

import useUser from '../hooks/useUser';
import { Notification as NotificationType } from '../types';
import Notification from './Notification';
import useNotifications from '../hooks/useNotifications';
import useCheckNotification from '../hooks/useCheckNotification';
import useReadAllNotifications from '../hooks/useReadAllNotifications';

const Inbox = () => {
    const { data: currentUser } = useUser();
    const { isLoading, isError, data } = useNotifications();
    const { mutate: checkNotificationMutate } = useCheckNotification();
    const { mutate: readAllNotificaionMutate } = useReadAllNotifications();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        if (isOpen && currentUser?.hasNewNotification) {
            checkNotificationMutate({ userId: currentUser.id });
        }
    }, [isOpen, currentUser, checkNotificationMutate]);

    const readAllNotificationsHandler = () => {
        if (data?.map((notification) => notification.read).includes(false)) {
            readAllNotificaionMutate();
        }
    };

    let notificaionts: NotificationType[] = [];

    if (data && filter === 'all') {
        notificaionts = data;
    }

    if (data && filter === 'unread') {
        notificaionts = data.filter((notification) => !notification.read);
    }

    return (
        <div className="">
            <div className="tooltip" data-tip="Inbox">
                <button className="btn-ghost btn-sm btn px-1" onClick={() => setIsOpen(!isOpen)}>
                    <div className="indicator">
                        <span
                            className={`indicator-bottom badge-error badge badge-xs indicator-item left-[8px] top-[7px] ${
                                currentUser?.hasNewNotification ? 'block' : 'hidden'
                            }`}
                        ></span>
                        <HiBell className="text-2xl" />
                    </div>
                </button>
            </div>

            {isOpen && (
                <div>
                    {isLoading ? (
                        <ul className="menu menu-compact absolute w-72 rounded-lg  bg-white p-3 shadow-lg">
                            <SyncLoader
                                size={10}
                                color="#394E6A"
                                margin={7}
                                className="self-center"
                            />
                        </ul>
                    ) : (
                        <>
                            {isError ? (
                                <div>Error...</div>
                            ) : (
                                <div className="fixed inset-0 md:top-5 md:left-5 bottom-[75px] z-30 w-full md:max-w-[320px]">
                                    <div className="flex h-full w-full flex-col rounded-md bg-base-100">
                                        <div className="rounded-none border-b bg-base-300 p-5 sm:rounded-t-md">
                                            <div className="flex justify-between">
                                                <span className="text-3xl font-bold">Inbox</span>
                                                <button
                                                    className="btn-outline btn-sm btn-circle btn flex bg-white"
                                                    onClick={() => setIsOpen(!isOpen)}
                                                >
                                                    <HiX />
                                                </button>
                                            </div>
                                            <div className="mt-5 flex justify-between">
                                                <div>
                                                    <button
                                                        className={`btn-outline btn-sm btn bg-base-100 normal-case ${
                                                            filter === 'all'
                                                                ? 'bg-base-content text-white'
                                                                : ''
                                                        } mr-3`}
                                                        onClick={() => setFilter('all')}
                                                    >
                                                        All
                                                    </button>
                                                    <button
                                                        className={`btn-outline btn-sm btn bg-base-100 normal-case ${
                                                            filter === 'unread'
                                                                ? 'bg-base-content text-white'
                                                                : ''
                                                        }`}
                                                        onClick={() => setFilter('unread')}
                                                    >
                                                        Unread
                                                    </button>
                                                </div>
                                                <button
                                                    className="btn-outline btn-sm btn bg-white normal-case"
                                                    onClick={readAllNotificationsHandler}
                                                >
                                                    Mark all as read
                                                </button>
                                            </div>
                                        </div>
                                        {notificaionts.length === 0 ? (
                                            <div className="flex h-full items-center justify-center">
                                                <div className="font-mono font-semibold">
                                                    You have no notifications...
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {notificaionts.map((notification) => {
                                                    return (
                                                        <Fragment key={notification.id}>
                                                            <Notification
                                                                notification={notification}
                                                                setIsOepn={setIsOpen}
                                                            />
                                                        </Fragment>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                    <div
                                        onClick={() => setIsOpen(false)}
                                        className="fixed inset-0 -z-20"
                                    ></div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Inbox;
