import axios from 'axios';

export const createMessage = async (formData: FormData) => {
	const { data } = await axios.post('http://localhost:8080/chat', formData, { withCredentials: true });

	return data;
};
