import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import useAuth, { isAuthSuccessResponse, isAuthErrorResponse } from '../hooks/useAuth';
import { useUser } from '../context/UserContext';

interface FormData {
	email: string;
	password: string;
}

const Login = () => {
	const navigate = useNavigate();

	const { login } = useAuth();

	const { currentUser, setCurrentUser } = useUser();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<FormData>();

	const onSubmit = handleSubmit(async (data) => {
		const { email, password } = data;

		const result = await login(email, password);

		if (isAuthSuccessResponse(result)) {
			setCurrentUser(result);
			navigate('/');
		}

		if (isAuthErrorResponse(result)) {
			setError('email', { type: 'incorrect', message: result.message });
			setError('password', { type: 'incorrect', message: result.message });
		}
	});

	if (currentUser) {
		return <Navigate to={'/'}></Navigate>;
	}

	return (
		//  background
		<div className="min-h-screen bg-base-300">
			<div className="container mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center">
				{/* form card */}
				<div className="w-full rounded-lg border bg-base-100 p-10">
					<form onSubmit={onSubmit} className="flex flex-col items-center justify-center gap-y-10">
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

						<button className="btn" type="submit">
							Log In
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;
