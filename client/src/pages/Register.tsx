import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

import { FormData, User } from '../types';
import useUser from '../hooks/useUser';
import { registerUser } from '../api/auth';

const Register = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: currentUser } = useUser();
	const { mutate: registerMutate } = useMutation({
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

	const onSubmit = handleSubmit(async (data) => {
		const { email, password, confirmPassword, username } = data;

		if (password !== confirmPassword) {
			setError('password', {
				type: 'match',
				message: 'Passwords should match',
			});

			return;
		}

		registerMutate({ email, password, username });
	});

	if (currentUser) {
		return <Navigate to={'/explorer'}></Navigate>;
	}

	return (
		<div className="min-h-screen bg-base-300">
			<div className="container mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center">
				<div className="w-full rounded-lg border bg-base-100 p-10">
					<div className="text-center text-2xl font-bold">Create an account</div>
					<form onSubmit={onSubmit} className="flex flex-col items-center justify-center gap-y-5">
						<div className="w-full">
							<label className="label">Email</label>
							<input
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
							{errors.email?.type === 'required' && (
								<p role="alert" className="text-error" data-cy="email-error">
									{errors.email.message}
								</p>
							)}
							{errors.email?.type === 'pattern' && (
								<p role="alert" className="text-error" data-cy="email-error">
									{errors.email.message}
								</p>
							)}
							{errors.email?.type === 'taken' && (
								<p role="alert" className="text-error" data-cy="email-error">
									{errors.email.message}
								</p>
							)}
						</div>
						<div className="w-full">
							<label className="label">Password</label>
							<input
								data-cy="password-input"
								className={`input-bordered input w-full ${errors.password && 'border-error'}`}
								type="password"
								{...register('password', {
									required: { value: true, message: 'Password is required' },
								})}
							/>
							{errors.password?.type === 'required' && (
								<p role="alert" className="text-error" data-cy="password-error">
									{errors.password.message}
								</p>
							)}
							{errors.password?.type === 'match' && (
								<p role="alert" className="text-error" data-cy="password-error">
									{errors.password.message}
								</p>
							)}
						</div>
						<div className="w-full">
							<label className="label">ConfirmPassword</label>
							<input
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
								data-cy="username-input"
								className={`input-bordered input w-full ${errors.username && 'border-error'}`}
								{...register('username', {
									required: { value: true, message: 'Username is required' },
								})}
							/>
							{errors.username?.type === 'required' && (
								<p role="alert" className="text-error" data-cy="username-error">
									{errors.username.message}
								</p>
							)}
							{errors.username?.type === 'taken' && (
								<p role="alert" className="text-error" data-cy="username-error">
									{errors.username.message}
								</p>
							)}
						</div>
						<button type="submit" className="btn w-full" data-cy="submit-button">
							Sign Up
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
