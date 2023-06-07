import { Link, Navigate, useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { SyncLoader } from 'react-spinners';

import { FormData, User } from '../types';
import useUser from '../hooks/useUser';
import { registerUser } from '../api/auth';

const Register = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: currentUser } = useUser();
	const { mutate: registerMutate, isLoading } = useMutation({
		mutationFn: ({ email, password, username }: { email: string; password: string; username: string }) =>
			registerUser(email, password, username),
		async onSuccess() {
			await queryClient.invalidateQueries<User>(['currentUser']);
			navigate('/explorer');
		},
		onError(error: AxiosError | Error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.data.message.includes('email')) {
					setError('email', { type: 'taken', message: error.response?.data.message });
				} else if (error.response?.data.message.includes('username')) {
					setError('username', { type: 'taken', message: error.response?.data.message });
				}
			}
		},
	});
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<FormData>();

	const submitHandler: SubmitHandler<FormData> = (data) => {
		const { email, password, confirmPassword, username } = data;

		if (password !== confirmPassword) {
			setError('password', {
				type: 'match',
				message: 'Passwords should match',
			});

			return;
		}

		registerMutate({ email, password, username });
	};

	if (currentUser) {
		return <Navigate to={'/explorer'}></Navigate>;
	}

	return (
		<div className="bg-base-100 min-h-screen">
			<div className="container mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center">
				<div className="bg-base-100 relative w-full rounded-lg p-10 shadow-none sm:border sm:shadow-lg">
					{isLoading && <div className="absolute inset-0 cursor-not-allowed rounded-lg bg-gray-200 opacity-50"></div>}
					<div className="text-center text-2xl font-bold">Create an account</div>
					<form onSubmit={handleSubmit(submitHandler)} className="flex flex-col items-center justify-center gap-y-3">
						<div className="w-full">
							<label className="label">Email</label>
							<input
								disabled={isLoading}
								data-cy="email-input"
								className={`input-bordered input w-full ${errors.email && 'border-error'}`}
								{...register('email', {
									required: { value: true, message: 'Email is required' },
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
							<label className="label">Password</label>
							<input
								disabled={isLoading}
								data-cy="password-input"
								className={`input-bordered input w-full ${errors.password && 'border-error'}`}
								type="password"
								{...register('password', {
									required: { value: true, message: 'Password is required' },
								})}
							/>
							{(errors.password?.type === 'required' || errors.password?.type === 'match') && (
								<p role="alert" className="text-error" data-cy="password-error">
									{errors.password.message}
								</p>
							)}
						</div>
						<div className="w-full">
							<label className="label">ConfirmPassword</label>
							<input
								disabled={isLoading}
								data-cy="confirmPassword-input"
								className={`input-bordered input w-full ${errors.password && 'border-error'}`}
								type="password"
								{...register('confirmPassword', {
									required: { value: true, message: 'Password is required' },
								})}
							/>
							{errors.confirmPassword?.type === 'required' && (
								<p role="alert" className="text-error" data-cy="confirmPassword-error">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>
						<div className="w-full">
							<label className="label">Username</label>
							<input
								disabled={isLoading}
								data-cy="username-input"
								className={`input-bordered input w-full ${errors.username && 'border-error'}`}
								{...register('username', {
									required: { value: true, message: 'Username is required' },
								})}
							/>
							{(errors.username?.type === 'required' || errors.username?.type === 'taken') && (
								<p role="alert" className="text-error" data-cy="username-error">
									{errors.username.message}
								</p>
							)}
						</div>
						<button type="submit" className="btn mt-5 w-full" data-cy="submit-button" disabled={isLoading}>
							{isLoading ? <SyncLoader color="#021431" size={10} margin={4} /> : <span>signup</span>}
						</button>
						<div className="flex w-full justify-center gap-x-4 text-sm font-semibold">
							<span>Already have an account?</span>
							<Link to={'/login'} className="underline hover:cursor-pointer">
								Login
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Register;
