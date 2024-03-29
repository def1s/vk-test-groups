import cls from './GroupsList.module.scss';
import { classNames } from 'shared/lib/classNames/classNames';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from 'shared/api/fetchGroups';
import { getGroups, GroupCard, groupsActions } from 'entities/GroupCard';
import { Loader } from 'shared/ui/Loader/Loader';
import { Filters, filtersActions, getCurrentFilters, getFilteredGroups } from 'features/Filters';

interface GroupsListProps {
    className?: string
}

export const GroupsList = ({ className }: GroupsListProps) => {
	// обычно выношу в отдельный хук для запросов
	const [error, setError] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const dispatch = useDispatch();
	const groups = useSelector(getGroups);
	const filteredGroups = useSelector(getFilteredGroups);
	// достаю, чтобы отрисовывать выбранные фильтры
	const currentFilters = useSelector(getCurrentFilters);


	// функция для запроса данных с условного бекенда (обычно выношу в отдельный хук вместе с loading и error)
	const fetchGroupsData = async () => {
		setError(false); // каждый раз при новом запросе сбрасываем ошибку в false

		try {
			setLoading(true); // пытаемся получить данные

			const response = await fetchGroups();
			if (response.result === 1 && response.data) { // если не идет в true - значит ошибка, данные не пришли
				dispatch(groupsActions.setGroupsList(response.data));
			} else {
				setError(true);
			}
		} catch (error) {
			console.error(error);
			setError(true);
		} finally { // в любом случае завершаем загрузку
			setLoading(false);
		}
	};


	// при первом запуске запрашиваем данные с уловного бекенда
	useEffect(() => {
		fetchGroupsData();
	}, []);


	// отрисовка карточек групп
	const renderGroups = () => {
		if (filteredGroups.length === 0) {
			return 'Список пуст!';
		}

		return filteredGroups.map((group) => {
			const { id, ...groupProps } = group;
			return <GroupCard key={id} id={id} {...groupProps} />;
		});
	};


	// достаю фильтры для цветов и готовлю их для передачи в компонент фильтров
	const colors = Array.from(
		new Set(groups.map(group => group.avatar_color))
	);

	const colorsFilters = useMemo(() => {
		return colors.map(color => ({
			label: color,
			value: color
		}));
	}, [colors]);


	// далее идут проверки для условного отображения
	const isError = error && !loading;
	const isLoading = loading && !error;
	const content = !error && !loading ? renderGroups() : null;

	// если ошибка - не будет отрисовывать виджет впринципе, покажем лишь сообщение об ошибке
	if (isError) {
		return <div className={cls.error}>Something went wrong... Reload the page!</div>;
	}

	// выводим спиннер, если данные загружаются и нет ошибки
	if (isLoading) {
		return (
			<div className={classNames(cls.GroupsList, {}, [className])}>
				<Loader/>
			</div>
		);
	}

	return (
		<div className={classNames(cls.GroupsList, {}, [className])}>
			<div className={cls.wrapper}>
				<Filters
					filters={
						[
							{ label: 'ВСЕ', value: null },
							{ label: 'ОТКРЫТЫЕ', value: false },
							{ label: 'ЗАКРЫТЫЕ', value: true },
						]
					}
					filterAction={filtersActions.setClosedFilter}
					currentFilter={currentFilters.closed}
				/>

				<Filters
					filters={
						[
							{ label: 'ВСЕ', value: null },
							{ label: 'С ДРУЗЬЯМИ', value: true },
							{ label: 'БЕЗ ДРУЗЕЙ', value: false }
						]
					}
					filterAction={filtersActions.setFriendsFilter}
					currentFilter={currentFilters.hasFriends}
				/>

				<Filters
					filters={
						[
							{
								label: 'ВСЕ',
								value: null
							},
							...colorsFilters
						]
					}
					filterAction={filtersActions.setAvatarFilter}
					currentFilter={currentFilters.avatarColor}
				/>
			</div>

			{content}
		</div>
	);
};
