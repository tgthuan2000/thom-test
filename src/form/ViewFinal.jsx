import { LoadingButton } from '@mui/lab'
import { Tooltip, Typography } from '@mui/material'
import React, { useRef, useImperativeHandle, useState } from 'react'
import { useMemo } from 'react'
import { useEffect } from 'react'

const ViewFinal = React.forwardRef(({ data, onSubmit }, ref) => {
	const innerRef = useRef(null)
	const [loading, setLoading] = useState(false)

	const read = useMemo(() => {
		const { key_word, content, vocabulary } = data
		const contentArray = content.split(key_word)
		const vocabularies = vocabulary.split('\n').map((value) => {
			const [en, vi] = value.split('|')
			return { en, vi }
		})
		const result = []
		for (let i = 0; i < contentArray.length; i++) {
			result.push(contentArray[i])
			if (i !== contentArray.length - 1) {
				result.push(
					<Tooltip key={i} title={vocabularies[i].vi}>
						<span className='text-red-500 cursor-pointer font-normal'>
							{vocabularies[i].en}
						</span>
					</Tooltip>
				)
			}
		}
		return result
	}, [data])

	useImperativeHandle(ref, () => ({
		scrollIntoView: () => {
			innerRef.current.scrollIntoView({
				behavior: 'smooth',
			})
		},
	}))

	useEffect(() => {
		innerRef.current.scrollIntoView({
			behavior: 'smooth',
		})
	}, [])

	const handleApprove = async () => {
		const answer = confirm('Chắc chắn muốn duyệt ?')
		if (answer) {
			setLoading(true)
			await onSubmit?.()
			setLoading(false)
		}
	}

	return (
		<div ref={innerRef} className='p-6 shadow-lg border rounded-lg'>
			<div className='flex justify-between'>
				<Typography variant='h5' className='select-none font-normal'>
					Xem trước
				</Typography>
				<LoadingButton
					type='submit'
					variant='contained'
					color='secondary'
					loading={loading}
					onClick={handleApprove}
				>
					Xác nhận & Lưu
				</LoadingButton>
			</div>

			{read && (
				<div className='mt-10 max-w-3xl mx-auto'>
					<Typography
						variant='subtitle2'
						fontWeight={200}
						fontStyle='italic'
						className='text-gray-500 select-none'
					>
						* Rê chuột vào từ vựng để hiển thị nghĩa tiếng Việt
					</Typography>
					<div className='border mt-2 mb-20 p-6 cursor-default'>
						<h6 className='select-none text-center text-xl my-3'>{data.title}</h6>
						<div className='whitespace-pre-line'>{read}</div>
					</div>
				</div>
			)}
		</div>
	)
})

export default ViewFinal
