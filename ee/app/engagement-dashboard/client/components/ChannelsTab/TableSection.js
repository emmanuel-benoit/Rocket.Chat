import { Box, Icon, Margins, Pagination, Select, Skeleton, Table, Tile } from '@rocket.chat/fuselage';
import moment from 'moment';
import React, { useMemo, useState } from 'react';

import { useTranslation } from '../../../../../../client/contexts/TranslationContext';
import { Growth } from '../data/Growth';
import { Section } from '../Section';
import { useEndpointData } from '../../hooks/useEndpointData';

export function TableSection() {
	const t = useTranslation();

	const periodOptions = useMemo(() => [
		['last 7 days', t('Last 7 days')],
		['last 30 days', t('Last 30 days')],
		['last 90 days', t('Last 90 days')],
	], [t]);

	const [periodId, setPeriodId] = useState('last 7 days');

	const period = useMemo(() => {
		switch (periodId) {
			case 'last 7 days':
				return {
					start: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(7, 'days'),
					end: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(1),
				};

			case 'last 30 days':
				return {
					start: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(30, 'days'),
					end: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(1),
				};

			case 'last 90 days':
				return {
					start: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(90, 'days'),
					end: moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(1),
				};
		}
	}, [periodId]);

	const handlePeriodChange = (periodId) => setPeriodId(periodId);

	const [current, setCurrent] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(25);

	const params = useMemo(() => ({
		start: period.start.toISOString(),
		end: period.end.toISOString(),
		offset: current,
		count: itemsPerPage,
	}), [period, current, itemsPerPage]);

	const data = useEndpointData('GET', 'engagement-dashboard/channels/list', params);

	const channels = useMemo(() => {
		if (!data) {
			return;
		}

		return data.channels.map(({
			room: { t, name, usernames, ts, _updatedAt },
			messages,
			diffFromLastWeek,
		}) => ({
			t,
			name: name || usernames.join(' × '),
			createdAt: ts,
			updatedAt: _updatedAt,
			messagesCount: messages,
			messagesVariation: diffFromLastWeek,
		}));
	}, [data]);

	return <Section filter={<Select options={periodOptions} value={periodId} onChange={handlePeriodChange} />}>
		<Box>
			{channels && !channels.length && <Tile textStyle='p1' textColor='info' style={{ textAlign: 'center' }}>
				{t('No data found')}
			</Tile>}
			{(!channels || channels.length)
			&& <Table>
				<Table.Head>
					<Table.Row>
						<Table.Cell>{t('#')}</Table.Cell>
						<Table.Cell>{t('Channel')}</Table.Cell>
						<Table.Cell>{t('Created')}</Table.Cell>
						<Table.Cell>{t('Last active')}</Table.Cell>
						<Table.Cell>{t('Messages sent')}</Table.Cell>
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{channels && channels.map(({ t, name, createdAt, updatedAt, messagesCount, messagesVariation }, i) =>
						<Table.Row key={i}>
							<Table.Cell>{i + 1}.</Table.Cell>
							<Table.Cell>
								<Margins inlineEnd='x4'>
									{(t === 'd' && <Icon name='at' />)
								|| (t === 'c' && <Icon name='lock' />)
								|| (t === 'p' && <Icon name='hashtag' />)}
								</Margins>
								{name}
							</Table.Cell>
							<Table.Cell>
								{moment(createdAt).format('L')}
							</Table.Cell>
							<Table.Cell>
								{moment(updatedAt).format('L')}
							</Table.Cell>
							<Table.Cell>
								{messagesCount} <Growth>{messagesVariation}</Growth>
							</Table.Cell>
						</Table.Row>)}
					{!channels && Array.from({ length: 5 }, (_, i) =>
						<Table.Row key={i}>
							<Table.Cell>
								<Skeleton width='100%' />
							</Table.Cell>
							<Table.Cell>
								<Skeleton width='100%' />
							</Table.Cell>
							<Table.Cell>
								<Skeleton width='100%' />
							</Table.Cell>
							<Table.Cell>
								<Skeleton width='100%' />
							</Table.Cell>
							<Table.Cell>
								<Skeleton width='100%' />
							</Table.Cell>
						</Table.Row>)}
				</Table.Body>
			</Table>}
			<Pagination
				current={current}
				itemsPerPage={itemsPerPage}
				itemsPerPageLabel={() => t('Items per page:')}
				showingResultsLabel={({ count, current, itemsPerPage }) =>
					t('Showing results %s - %s of %s', current + 1, Math.min(current + itemsPerPage, count), count)}
				count={1} // TODO
				onSetItemsPerPage={setItemsPerPage}
				onSetCurrent={setCurrent}
			/>
		</Box>
	</Section>;
}