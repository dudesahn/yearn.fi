import {AnimatePresence, motion} from 'framer-motion';
import Meta from '@common/components/Meta';
import {CurveContextApp} from '@common/contexts/useCurve';
import {useCurrentApp} from '@common/hooks/useCurrentApp';
import {variants} from '@common/utils/animations';
import {YCRVContextApp} from '@yCRV/contexts/useYCRV';

import type {NextRouter} from 'next/router';
import type {ReactElement} from 'react';

export function Wrapper({children, router}: {children: ReactElement; router: NextRouter}): ReactElement {
	const {manifest} = useCurrentApp(router);

	return (
		<>
			<Meta meta={manifest} />
			<YCRVContextApp>
				<CurveContextApp>
					<AnimatePresence mode={'wait'}>
						<motion.div
							key={router.asPath}
							initial={'initial'}
							animate={'enter'}
							exit={'exit'}
							className={'my-0 h-full md:mb-0 md:mt-16'}
							variants={variants}>
							{children}
						</motion.div>
					</AnimatePresence>
				</CurveContextApp>
			</YCRVContextApp>
		</>
	);
}
