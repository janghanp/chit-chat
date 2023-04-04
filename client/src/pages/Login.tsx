import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import useUser from '../hooks/useUser';
import { logInUser } from '../api/auth';
import axios, { AxiosError } from 'axios';

interface FormData {
	email: string;
	password: string;
}

const Login = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: currentUser } = useUser();
	const { mutate } = useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) => logInUser(email, password),
		async onSuccess() {
			await queryClient.invalidateQueries(['currentUser']);
			navigate('/explorer');
		},
		onError(error: AxiosError | Error) {
			if (axios.isAxiosError(error)) {
				setError('email', { type: 'incorrect', message: error.response?.data.message });
				setError('password', { type: 'incorrect', message: error.response?.data.message });
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
		const { email, password } = data;

		mutate({ email, password });
	});

	if (currentUser) {
		return <Navigate to={'/explorer'}></Navigate>;
	}

	return (
		<div className="min-h-screen bg-base-300">
			<div className="container mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center">
				<div className="w-full rounded-lg border bg-base-100 p-10">
					<div className="text-center text-2xl font-bold">Welcome to chit-chat</div>
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
							{errors.email?.type === 'incorrect' && (
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
							{errors.password?.type === 'incorrect' && (
								<p role="alert" className="text-error">
									{errors.password.message}
								</p>
							)}
						</div>
						<button className="btn w-full" type="submit">
							Log In
						</button>
					</form>
					<div className="mt-5 text-center text-sm font-semibold">
						<span>Don't have an account?</span>
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
