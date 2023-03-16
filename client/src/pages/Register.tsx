import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { FormData } from '../types';
import useAuth, { isAuthSuccessResponse, isAuthErrorResponse } from '../hooks/useAuth';
import { useUser } from '../context/UserContext';

const Register = () => {
	const navigate = useNavigate();

	const { register: authRegister } = useAuth();

	const { currentUser, setCurrentUser } = useUser();

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

		const result = await authRegister(email, password, username);

		if (isAuthSuccessResponse(result)) {
			setCurrentUser(result);
			navigate('/');
		}

		if (isAuthErrorResponse(result)) {
			if (result.message.includes('email')) {
				setError('email', { type: 'taken', message: result.message });
			} else if (result.message.includes('username')) {
				setError('username', { type: 'taken', message: result.message });
			}
		}
	});

	if (currentUser) {
		return <Navigate to={'/'}></Navigate>;
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
								<p role="alert" className="text-error">
									{errors.email.message}
								</p>
							)}

							{errors.email?.type === 'pattern' && (
								<p role="alert" className="text-error">
									{errors.email.message}
								</p>
							)}

							{errors.email?.type === 'taken' && (
								<p role="alert" className="text-error">
									{errors.email.message}
								</p>
							)}
						</div>

						<div className="w-full">
							<label className="label">Password</label>
							<input
								className={`input-bordered input w-full ${errors.password && 'border-error'}`}
								type="password"
								{...register('password', {
									required: { value: true, message: 'Password is required' },
								})}
							/>

							{errors.password?.type === 'required' && (
								<p role="alert" className="text-error">
									{errors.password.message}
								</p>
							)}

							{errors.password?.type === 'match' && (
								<p role="alert" className="text-error">
									{errors.password.message}
								</p>
							)}
						</div>

						<div className="w-full">
							<label className="label">ConfirmPassword</label>
							<input
								className={`input-bordered input w-full ${errors.password && 'border-error'}`}
								type="password"
								{...register('confirmPassword', {
									required: { value: true, message: 'Password is required' },
								})}
							/>

							{errors.confirmPassword?.type === 'required' && (
								<p role="alert" className="text-error">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>

						<div className="w-full">
							<label className="label">Username</label>
							<input
								className={`input-bordered input w-full ${errors.username && 'border-error'}`}
								{...register('username', {
									required: { value: true, message: 'Username is required' },
								})}
							/>

							{errors.username?.type === 'required' && (
								<p role="alert" className="text-error">
									{errors.username.message}
								</p>
							)}

							{errors.username?.type === 'taken' && (
								<p role="alert" className="text-error">
									{errors.username.message}
								</p>
							)}
						</div>

						<button type="submit" className="btn w-full">
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
