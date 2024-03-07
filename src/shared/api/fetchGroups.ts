import groupsData from './groups.json';

interface GetGroupsResponse {
	result: 1 | 0,
	data?: Group[]
}

interface Group {
	'id': number,
	'name': string,
	'closed': boolean,
	'avatar_color'?: string,
	'members_count': number,
	'friends'?: User[]
}

interface User {
	'first_name': string,
	'last_name': string
}

const delay = async (ms: number) => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

const fetchGroups = async (): Promise<GetGroupsResponse> => {
	await delay(1000);

	const isSuccess = Math.random() < 0.7;
	if (isSuccess) {
		return {
			result: 1,
			data: groupsData
		};
	} else {
		return {
			result: 0
		};
	}
};

export { fetchGroups };
