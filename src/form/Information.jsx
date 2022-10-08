import { Button, TextField, Typography } from '@mui/material'
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { LoadingButton } from '@mui/lab'
import { KEY_WORD_STORAGE_KEY } from '../contants'

yup.addMethod(yup.string, 'checkVocabulary', function (message) {
	return this.test('checkVocabulary', message, function (value) {
		const { path, createError } = this
		try {
			return (
				value
					.split('\n')
					.map((value) => value.split('|'))
					.every((value) => value.length === 2) || createError({ path, message })
			)
		} catch (error) {
			return createError({ path, message })
		}
	})
})

yup.addMethod(yup.string, 'checkStoryKeyWord', function (keyWord, message) {
	return this.test('checkStoryKeyWord', keyWord, function (value) {
		const { path, createError } = this
		try {
			return value.indexOf(keyWord) !== -1 || createError({ path, message })
		} catch (error) {
			return createError({ path, message })
		}
	})
})

yup.addMethod(yup.string, 'checkStoryVocabulary', function (keyWord, vocabulary, message) {
	return this.test('checkStoryVocabulary', keyWord, function (value) {
		const { path, createError } = this
		try {
			return (
				value.split(keyWord).length - 1 === vocabulary.split('\n').length ||
				createError({ path, message })
			)
		} catch (error) {
			return createError({ path, message })
		}
	})
})

const schema = yup.object().shape({
	key_word: yup.string().required('Yêu cầu nhập từ khóa'),
	title: yup.string().required('Yêu cầu nhập tiêu đề'),
	content: yup
		.string()
		.required('Yêu cầu nhập nội dung')
		.when('key_word', (key_word, schema) => {
			return schema.checkStoryKeyWord(key_word, 'Từ khóa không tồn tại trong nội dung')
		})
		.when(['key_word', 'vocabulary'], (key_word, vocabulary, schema) => {
			return schema.checkStoryVocabulary(
				key_word,
				vocabulary,
				'Lượng từ vựng và từ khóa trong nội dung chưa khớp'
			)
		}),
	vocabulary: yup
		.string()
		.required('Yêu cầu nhập từ vựng')
		.checkVocabulary('Cú pháp không hợp lệ'),
})

const defaultValues = {
	key_word: '',
	title: '',
	content: '',
	vocabulary: '',
}

const Information = React.forwardRef(({ onSubmit, onReset, disabled }, ref) => {
	const innerRef = useRef(null)
	const { handleSubmit, control, watch, reset } = useForm({
		resolver: yupResolver(schema),
		defaultValues,
	})

	useEffect(() => {
		const { key_word } = defaultValues
		reset({
			key_word: localStorage.getItem(KEY_WORD_STORAGE_KEY) ?? key_word,
		})
	}, [])

	const submitForm = (data) => {
		onSubmit?.(data)
	}

	const handleReset = () => {
		onReset?.()
	}

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

	return (
		<form
			ref={innerRef}
			onSubmit={handleSubmit(submitForm)}
			className='p-6 shadow-lg border rounded-lg'
		>
			<div className='flex justify-between'>
				<Typography variant='h5' className='select-none font-normal'>
					Phiếu nhập thông tin
				</Typography>
				{disabled ? (
					<Button type='button' variant='outlined' onClick={handleReset}>
						Nhập lại
					</Button>
				) : (
					<LoadingButton
						type='submit'
						disabled={
							!watch('key_word') ||
							!watch('title') ||
							!watch('content') ||
							!watch('vocabulary')
						}
						variant='contained'
						color='warning'
					>
						Xem trước
					</LoadingButton>
				)}
			</div>
			<div className='mt-6'>
				<Controller
					control={control}
					name='key_word'
					render={({ field, fieldState: { error } }) => (
						<TextField
							label='*Từ khóa'
							variant='outlined'
							size='small'
							disabled={disabled}
							placeholder='[*]'
							error={!!error}
							helperText={error?.message}
							{...field}
						/>
					)}
				/>
			</div>
			<div className='mt-6'>
				<Controller
					control={control}
					name='title'
					render={({ field, fieldState: { error } }) => (
						<TextField
							label='Tiêu đề'
							variant='outlined'
							size='small'
							disabled={disabled}
							fullWidth
							error={!!error}
							helperText={error?.message}
							{...field}
						/>
					)}
				/>
			</div>
			<div className='mt-6 flex flex-col md:flex-row gap-6'>
				<Controller
					control={control}
					name='content'
					render={({ field, fieldState: { error } }) => (
						<TextField
							fullWidth
							label='Nội dung mẫu truyện'
							variant='outlined'
							size='small'
							rows={16}
							multiline
							className='flex-[2]'
							placeholder='Nhập nội dung truyện...'
							disabled={disabled}
							error={!!error}
							helperText={error?.message || 'Nội dung truyện phải chứa *Từ khóa'}
							{...field}
						/>
					)}
				/>
				<Controller
					control={control}
					name='vocabulary'
					render={({ field, fieldState: { error } }) => (
						<TextField
							fullWidth
							label='Danh sách từ vựng'
							variant='outlined'
							size='small'
							rows={16}
							multiline
							className='flex-1'
							placeholder={'apple | quả táo\nbanana | quả chuối'}
							disabled={disabled}
							error={!!error}
							helperText={
								error?.message || (
									<>
										Mỗi từ một dòng theo dạng: <br />
										Từ tiếng Anh | Nghĩa tiếng Việt
									</>
								)
							}
							{...field}
						/>
					)}
				/>
			</div>
		</form>
	)
})

export default Information
