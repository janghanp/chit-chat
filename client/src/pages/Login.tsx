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
		<div>
			<form onSubmit={onSubmit}>
				<label>Email</label>
				<input
					className="border"
					{...register('email', {
						required: { value: true, message: 'Email is required' },
						pattern: {
							value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
							message: 'Invalid email',
						},
					})}
					aria-invalid={errors.email ? 'true' : 'false'}
				/>

				{errors.email?.type === 'required' && <p role="alert">{errors.email.message}</p>}

				{errors.email?.type === 'pattern' && <p role="alert">{errors.email.message}</p>}

				{errors.email?.type === 'incorrect' && <p role="alert">{errors.email.message}</p>}

				<label>Password</label>
				<input
					className="border"
					type="password"
					{...register('password', {
						required: { value: true, message: 'Password is required' },
					})}
				/>

				{errors.password?.type === 'required' && <p role="alert">{errors.password.message}</p>}

				{errors.password?.type === 'incorrect' && <p role="alert">{errors.password.message}</p>}

				<button type="submit">Log In</button>
			</form>
		</div>
	);
};

export default Login;
