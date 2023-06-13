import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';

import PasswordResetWithToken from './PasswordResetWithToken';
import useSendEmailToResetPassword from '../hooks/useSendEmailToResetPassword';
import useUser from '../hooks/useUser';
import { useState } from 'react';

interface FormData {
    email: string;
}

const PasswordReset = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isSent, setIsSent] = useState<boolean>(false);
    const { data: currentUser } = useUser();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();
    const { mutate: sendEmailToResetPasswordMutate, isLoading } =
        useSendEmailToResetPassword(setIsSent);

    if (searchParams.get('token')) {
        return <PasswordResetWithToken token={searchParams.get('token')!} />;
    }

    const submitHandler: SubmitHandler<FormData> = (data) => {
        const { email } = data;

        sendEmailToResetPasswordMutate(email);
    };

    if (currentUser) {
        return <Navigate to={'/explorer'}></Navigate>;
    }

    return (
        <div className="h-[calc(100dvh)] bg-base-100">
            <div className="container h-[calc(100dvh)] mx-auto flex max-w-lg flex-col items-center justify-center">
                <div className="relative w-full rounded-lg bg-base-100 p-5 md:p-10 shadow-none sm:border sm:shadow-lg">
                    <div className="text-center text-2xl font-bold">Reset your password</div>
                    {isSent ? (
                        <>
                            <div className="my-5">
                                Check your email for a link to reset your password. If it dose not
                                appear within a few minutes, check your spam folder.
                            </div>

                            <button
                                className="btn normal-case w-full"
                                onClick={() => navigate('/login')}
                            >
                                Return to log in
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="font-semibold text-sm my-5">
                                Enter your user account&apos;s verified email address and we will
                                send you a password reset link.
                            </div>
                            <form
                                onSubmit={handleSubmit(submitHandler)}
                                className="flex flex-col items-center justify-center gap-y-5"
                            >
                                <div className="w-full">
                                    <input
                                        disabled={isLoading}
                                        data-cy="email-input"
                                        className={`input-bordered input w-full ${
                                            errors.email && 'border-error'
                                        }`}
                                        placeholder="Enter your email address"
                                        {...register('email', {
                                            required: {
                                                value: true,
                                                message: 'Email is required',
                                            },
                                            pattern: {
                                                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
                                                message: 'Invalid email',
                                            },
                                        })}
                                        aria-invalid={errors.email ? 'true' : 'false'}
                                    />
                                    {(errors.email?.type === 'required' ||
                                        errors.email?.type === 'pattern' ||
                                        errors.email?.type === 'incorrect') && (
                                        <p
                                            role="alert"
                                            className="text-error"
                                            data-cy="email-error"
                                        >
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                                <button className="btn normal-case w-full" disabled={isLoading}>
                                    Send password reset email
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PasswordReset;
