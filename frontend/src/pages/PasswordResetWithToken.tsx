import { Navigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';

import useVerifyToken from '../hooks/useVerifyToken';
import useChangePassword from '../hooks/useChangePassword';

interface Props {
    token: string;
}

interface FormData {
    password: string;
    confirmPassword: string;
}

const PasswordResetWithToken = ({ token }: Props) => {
    const { data: decodedToken, isLoading, isError } = useVerifyToken(token);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormData>();
    const { mutate: changePasswordMutate, isLoading: changePasswordIsLoading } =
        useChangePassword();

    const submitHandler: SubmitHandler<FormData> = (data) => {
        const { password, confirmPassword } = data;

        if (password !== confirmPassword) {
            setError('password', {
                type: 'match',
                message: 'Passwords should match',
            });

            return;
        }

        changePasswordMutate({ email: decodedToken!.email, password });
    };

    if (isLoading) {
        return <div></div>;
    }

    if (isError || !decodedToken) {
        return <Navigate to={'/password_reset'}></Navigate>;
    }

    return (
        <div className="h-[calc(100dvh)] bg-base-100">
            <div className="container h-[calc(100dvh)] mx-auto flex max-w-lg flex-col items-center justify-center">
                <div className="relative w-full rounded-lg bg-base-100 p-5 md:p-10 shadow-none sm:border sm:shadow-lg">
                    <div className="text-center text-2xl">
                        Change password for{' '}
                        <span className="font-bold">{decodedToken.username}</span>
                    </div>
                    <form
                        onSubmit={handleSubmit(submitHandler)}
                        className="flex flex-col items-center justify-center gap-y-5"
                    >
                        <div className="w-full">
                            <label className="label">Password</label>
                            <input
                                disabled={changePasswordIsLoading}
                                data-cy="password-input"
                                className={`input-bordered input w-full ${
                                    errors.password && 'border-error'
                                }`}
                                type="password"
                                {...register('password', {
                                    required: {
                                        value: true,
                                        message: 'Password is required',
                                    },
                                })}
                            />
                            {(errors.password?.type === 'required' ||
                                errors.password?.type === 'match') && (
                                <p role="alert" className="text-error" data-cy="password-error">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        <div className="w-full">
                            <label className="label">ConfirmPassword</label>
                            <input
                                disabled={changePasswordIsLoading}
                                data-cy="confirmPassword-input"
                                className={`input-bordered input w-full ${
                                    errors.password && 'border-error'
                                }`}
                                type="password"
                                {...register('confirmPassword', {
                                    required: {
                                        value: true,
                                        message: 'Password is required',
                                    },
                                })}
                            />
                            {errors.confirmPassword?.type === 'required' && (
                                <p
                                    role="alert"
                                    className="text-error"
                                    data-cy="confirmPassword-error"
                                >
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                        <button
                            className="btn normal-case w-full"
                            disabled={changePasswordIsLoading}
                        >
                            Change password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetWithToken;
