interface Idiom {
	idiom: string;
	description: string;
	examples: string[];
	examImages?: string[];  // 可选的图片 URL 数组
	major_type_code: string;
	minor_type_code: string;
}

interface Env {
	DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const url = new URL(request.url);

		try {
			// 获取所有成语
			if (url.pathname === '/idioms' && request.method === 'GET') {
				const result = await env.DB
					.prepare('SELECT idiom, description, examples, exam_images, major_type_code, minor_type_code FROM idioms ORDER BY major_type_code')
					.all();

				const idioms = result.results?.map(row => ({
					idiom: row.idiom,
					description: row.description,
					examples: JSON.parse(row.examples as string),
					examImages: row.exam_images ? JSON.parse(row.exam_images as string) : [],
					major_type_code: row.major_type_code,
					minor_type_code: row.minor_type_code,
				}));

				return new Response(JSON.stringify(idioms), {
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}

			if (url.pathname === '/idiom_major_types' && request.method === 'GET') {
				const typeCode = url.searchParams.get('type_code');
			
				let query = 'SELECT type_code, type_name, description FROM idiom_major_types';
				let stmt;
				
				if (typeCode && typeCode !== 'all') {
					query += ' WHERE type_code = ?';
					stmt = env.DB.prepare(query);
					stmt = stmt.bind(typeCode);
				} else {
					stmt = env.DB.prepare(query);
				}
				console.log("typeCode", typeCode);
				const result = await stmt.all();
				
				const major_types = result.results?.map(row => ({
					type_code: row.type_code,
					type_name: row.type_name,
					description: row.description,
				}));
			
				return new Response(JSON.stringify(major_types), {
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}

			if (url.pathname === '/idiom_minor_types' && request.method === 'GET') {
				const typeCode = url.searchParams.get('type_code'); // 获取查询参数

				let query = 'SELECT type_code, major_type_code, type_name, description FROM idiom_minor_types';
				let stmt;

				if (typeCode && typeCode !== 'all') {
					query += ' WHERE type_code = ?';
					stmt = env.DB.prepare(query);
					stmt = stmt.bind(typeCode);
				} else {
					stmt = env.DB.prepare(query);
				}

				const result = await stmt.all();
				console.log(result);
				const minor_types = result.results?.map(row => ({
					type_code: row.type_code,
					type_name: row.type_name,
					major_type_code: row.major_type_code,
					description: row.description,
				}));

				return new Response(JSON.stringify(minor_types), {
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}

            // 更新成语
            if (url.pathname === '/update-idiom' && request.method === 'POST') {
                const updatedIdiom: Idiom = await request.json();

                // 检查成语是否存在
                const checkResult = await env.DB
                    .prepare('SELECT COUNT(*) as count FROM idioms WHERE idiom = ?')
                    .bind(updatedIdiom.idiom)
                    .first();

                if ((checkResult === null) || (checkResult.count === 0)) {
                    // 如果成语不存在，插入新成语
                    const insertResult = await env.DB
                        .prepare(
                            `INSERT INTO idioms (idiom, description, examples, exam_images, major_type_code, minor_type_code) 
                            VALUES (?, ?, ?, ?, ?, ?)`
                        )
                        .bind(
                            updatedIdiom.idiom,
                            updatedIdiom.description,
                            JSON.stringify(updatedIdiom.examples),
                            updatedIdiom.examImages ? JSON.stringify(updatedIdiom.examImages) : null,
							updatedIdiom.major_type_code? updatedIdiom.major_type_code : null,
							updatedIdiom.minor_type_code? updatedIdiom.minor_type_code : null
                        )
                        .run();

                    if (insertResult.success) {
                        return new Response(JSON.stringify({ success: true, message: '成语已插入' }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    } else {
                        throw new Error('插入失败');
                    }
                }

                // 如果存在，执行更新
                const result = await env.DB
                    .prepare(
                        `UPDATE idioms 
                        SET description = ?, 
                            examples = ?,
                            exam_images = ?,
							major_type_code = ?,
							minor_type_code = ?
                        WHERE idiom = ?`
                    )
                    .bind(
                        updatedIdiom.description,
                        JSON.stringify(updatedIdiom.examples),
                        updatedIdiom.examImages ? JSON.stringify(updatedIdiom.examImages) : null,
						updatedIdiom.major_type_code? updatedIdiom.major_type_code : null,
						updatedIdiom.minor_type_code? updatedIdiom.minor_type_code : null,
                        updatedIdiom.idiom,
                    )
                    .run();

                if (result.success) {
                    return new Response(JSON.stringify({ success: true, message: '成语已更新' }), {
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders
                        }
                    });
                } else {
                    throw new Error('更新失败');
                }
            }
			// 上传真题图片
			if (url.pathname === '/upload-image' && request.method === 'POST') {
				// 这里需要根据你选择的图片存储方案来实现
				// 如果使用 Cloudflare Images:
				const formData = await request.formData();
				const image = formData.get('image') as File;
				const idiom = formData.get('idiom') as string;

				// TODO: 实现图片上传逻辑
				// 这里需要根据你选择的存储方案来实现
				// 返回图片 URL

				return new Response(JSON.stringify({ url: 'image_url_here' }), {
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				});
			}

			return new Response('Not Found', {
				status: 404,
				headers: corsHeaders
			});

		} catch (err) {
			console.error('Error:', err);
			return new Response(
				JSON.stringify({ error: err instanceof Error ? err.message : '未知错误' }),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders
					}
				}
			);
		}
	}
};