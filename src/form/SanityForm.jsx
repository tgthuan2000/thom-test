import React, { useState } from 'react'
import { Button, TextField, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'
import { PROJECT_ID_STORAGE_KEY, TOKEN_STORAGE_KEY } from '../contants'

const schema = yup.object().shape({
	project_id: yup.string().required('Yêu cầu nhập Project ID'),
	token: yup.string().required('Yêu cầu nhập Token'),
})

const defaultValues = { project_id: '', token: '' }

const SanityForm = ({ onSubmit, onReset, disabled }) => {
	const [loading, setLoading] = useState(false)
	const { handleSubmit, control, watch, reset } = useForm({
		resolver: yupResolver(schema),
		defaultValues,
	})

	useEffect(() => {
		const { project_id, token } = defaultValues
		reset({
			project_id: localStorage.getItem(PROJECT_ID_STORAGE_KEY) ?? project_id,
			token: localStorage.getItem(TOKEN_STORAGE_KEY) ?? token,
		})
	}, [])

	const submitForm = async (data) => {
		setLoading(true)
		await onSubmit?.(data)
		setLoading(false)
	}

	const handleReset = () => {
		onReset?.()
	}

	return (
		<form onSubmit={handleSubmit(submitForm)} className='p-6 shadow-lg border rounded-lg'>
			<div className='flex justify-between'>
				<Typography variant='h5' className='select-none font-normal'>
					Sanity
				</Typography>
				{disabled ? (
					<Button type='button' variant='outlined' onClick={handleReset}>
						Nhập lại
					</Button>
				) : (
					<LoadingButton
						type='submit'
						loading={loading}
						variant='contained'
						disabled={!watch('project_id') || !watch('token')}
					>
						Kiểm tra
					</LoadingButton>
				)}
			</div>
			<div className='mt-6 flex flex-col gap-4'>
				<Controller
					control={control}
					name='project_id'
					render={({ field }) => (
						<TextField
							fullWidth
							label='Project ID'
							variant='outlined'
							size='small'
							disabled={disabled || loading}
							{...field}
						/>
					)}
				/>
				<Controller
					control={control}
					name='token'
					render={({ field }) => (
						<TextField
							label='Token'
							variant='outlined'
							size='small'
							rows={8}
							multiline
							disabled={disabled || loading}
							{...field}
						/>
					)}
				/>
			</div>
		</form>
	)
}

export default SanityForm
