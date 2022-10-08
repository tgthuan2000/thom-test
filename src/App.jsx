import { CircularProgress, createTheme, ThemeProvider } from '@mui/material'
import React, { Suspense, useRef, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import sanityClient from '@sanity/client'
import {
	INFORMATION_STEP,
	KEY_WORD_STORAGE_KEY,
	PROJECT_ID_STORAGE_KEY,
	SANITY_STEP,
	TOKEN_STORAGE_KEY,
	VIEW_FINAL_STEP,
} from './contants'
import { uuid } from '@sanity/uuid'

const Information = React.lazy(() => import('./form/Information'))
const ViewFinal = React.lazy(() => import('./form/ViewFinal'))
const SanityForm = React.lazy(() => import('./form/SanityForm'))

const theme = createTheme({
	typography: {
		fontFamily: ['Lexend'].join(','),
		fontWeightRegular: 200,
		fontWeightMedium: 300,
		fontWeightBold: 400,
	},
})

function App() {
	const [step, setStep] = useState(SANITY_STEP)

	const viewFinalRef = useRef(null)
	const informationRef = useRef(null)
	const client = useRef(null)

	const [view, setView] = useState({
		key_word: '',
		title: '',
		content: '',
		vocabulary: '',
	})

	const [sanityAnimate] = useAutoAnimate()
	const [informationAnimate] = useAutoAnimate()
	const [viewFinalAnimate] = useAutoAnimate()

	const handleSubmitSanity = async (data) => {
		try {
			const { project_id, token } = data
			// config sanity client
			client.current = sanityClient({
				projectId: project_id,
				dataset: 'production',
				apiVersion: '2021-03-25',
				token,
			})
			await client.current.fetch('*[_type == "story"]')
			setStep(INFORMATION_STEP)
			informationRef.current?.scrollIntoView()
			toast.success('Kiểm tra thành công')
			localStorage.setItem(PROJECT_ID_STORAGE_KEY, project_id)
			localStorage.setItem(TOKEN_STORAGE_KEY, token)
		} catch (error) {
			toast.error('Kiểm tra thất bại')
			client.current = null
		}
	}

	const handleSubmitInformation = (data) => {
		try {
			setStep(VIEW_FINAL_STEP)
			viewFinalRef.current?.scrollIntoView()
			localStorage.setItem(KEY_WORD_STORAGE_KEY, data.key_word)
			setView(data)
		} catch (error) {}
	}

	const handleSubmitViewFinal = async () => {
		try {
			const { content, vocabulary, title } = view

			const __ = client.current.transaction()
			const vocabularies = []

			// vocabulary
			vocabulary.split('\n').forEach((vocab) => {
				const id = uuid()
				const [en, vi] = vocab.split('|')
				vocabularies.push({
					_type: 'reference',
					_key: id,
					_ref: id,
				})
				__.createIfNotExists({ _type: 'vocabulary', _id: id, en: en.trim(), vi: vi.trim() })
			})

			// story
			__.create({
				_type: 'story',
				content,
				title,
				vocabularies,
			})

			// commit
			await __.commit()

			toast.success('Khởi tạo thành công')
			informationRef.current?.scrollIntoView()
			setTimeout(() => {
				setStep(INFORMATION_STEP)
			}, 1000)
		} catch (error) {
			toast.error('Đã có lỗi khi tiến hành lưu')
		}
	}

	return (
		<ThemeProvider theme={theme}>
			<ToastContainer
				position='bottom-left'
				autoClose={2000}
				hideProgressBar
				newestOnTop={false}
				closeOnClick={false}
				rtl={false}
				pauseOnFocusLoss={false}
				draggable={false}
				pauseOnHover={false}
			/>
			<div className='p-6'>
				<div className='flex flex-col lg:flex-row gap-6'>
					<div className='flex-1' ref={sanityAnimate}>
						<Suspense fallback={<CircularProgress />}>
							{step >= SANITY_STEP && (
								<SanityForm
									onSubmit={handleSubmitSanity}
									onReset={() => {
										setStep(SANITY_STEP)
									}}
									disabled={step !== SANITY_STEP}
								/>
							)}
						</Suspense>
					</div>
					<div className='flex-[3]' ref={informationAnimate}>
						<Suspense fallback={<CircularProgress />}>
							{step >= INFORMATION_STEP && client.current && (
								<Information
									ref={informationRef}
									onSubmit={handleSubmitInformation}
									onReset={() => {
										setStep(INFORMATION_STEP)
									}}
									disabled={step !== INFORMATION_STEP}
								/>
							)}
						</Suspense>
					</div>
				</div>
				<div className='mt-10 flex gap-4'>
					<div className='flex-1' ref={viewFinalAnimate}>
						<Suspense fallback={<CircularProgress />}>
							{step >= VIEW_FINAL_STEP && (
								<ViewFinal
									ref={viewFinalRef}
									data={view}
									onSubmit={handleSubmitViewFinal}
								/>
							)}
						</Suspense>
					</div>
				</div>
			</div>
		</ThemeProvider>
	)
}

export default App
