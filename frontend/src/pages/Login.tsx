import { Link, Navigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SyncLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';

import useUser from '../hooks/useUser';
import useLogin from '../hooks/useLogin';

interface FormData {
    email: string;
    password: string;
}

const Login = () => {
    const navigate = useNavigate();
    const { data: currentUser } = useUser();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormData>();

    const { mutate: loginMutate, isLoading } = useLogin(setError);

    const submitHandler: SubmitHandler<FormData> = (data) => {
        const { email, password } = data;

        loginMutate({ email, password });
    };

    if (currentUser) {
        return <Navigate to={'/explorer'}></Navigate>;
    }

    return (
        <div className="h-[calc(100dvh)] bg-base-100">
            <div className="container h-[calc(100dvh)] mx-auto flex max-w-lg flex-col items-center justify-center">
                <div className="relative w-full rounded-lg bg-base-100 p-5 md:p-10 shadow-none sm:border sm:shadow-lg">
                    {isLoading && (
                        <div className="absolute inset-0 cursor-not-allowed rounded-lg bg-gray-200 opacity-50"></div>
                    )}
                    <div className="text-center text-2xl font-bold">Welcome to chit-chat</div>
                    <form
                        onSubmit={handleSubmit(submitHandler)}
                        className="flex flex-col items-center justify-center gap-y-5"
                    >
                        <div className="w-full">
                            <label className="label">Email</label>
                            <input
                                disabled={isLoading}
                                data-cy="email-input"
                                className={`input-bordered input w-full ${
                                    errors.email && 'border-error'
                                }`}
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
                                <p role="alert" className="text-error" data-cy="email-error">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                        <div className="w-full">
                            <label className="label">
                                Password{' '}
                                <span
                                    className="text-blue-500 hover:cursor-pointer text-sm"
                                    onClick={() => navigate('/password_reset')}
                                >
                                    Forgot password?
                                </span>
                            </label>
                            <input
                                disabled={isLoading}
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
                                errors.password?.type === 'incorrect') && (
                                <p role="alert" className="text-error" data-cy="password-error">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        <button
                            className="btn w-full"
                            type="submit"
                            data-cy="submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <SyncLoader color="#021431" size={10} margin={4} />
                            ) : (
                                <span>Log in</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-5 text-center text-sm font-semibold">
                        <span>Don&apos;t have an account?</span>
                        <Link to="/register">
                            <span className="ml-3 underline">register</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
