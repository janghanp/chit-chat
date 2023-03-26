import { HiSearch } from 'react-icons/hi';

const Search = () => {
	return (
		<div className="flex-1">
				<HiSearch className='absolute left-5 top-4' />
				<input type="text" placeholder="Search..." className="input-bordered input input-sm w-full pl-7" />
		</div>
	);
};

export default Search;
