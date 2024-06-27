const loginWith = async (
  page,
  username = 'mluukkai',
  password = 'salainen'
) => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
}

const createBlog = async (page, content) => {
  await page.getByRole('button', { name: 'Create blog' }).click()
  await page.getByRole('textbox').first().fill(content)
  await page.getByRole('textbox').last().fill('HTTPS://urlexample.com/')
  await page.getByRole('button', { name: 'Create' }).click()
  await page
    .getByText(content)
    .waitFor() /* La razón del problema es que cuando la prueba crea una nota, comienza a crear la siguiente incluso antes de que el servidor haya respondido, y la nota agregada se renderiza en la pantalla. Esto a su vez puede causar que algunas notas se pierdan (en la imagen, esto ocurrió con la segunda nota creada), ya que el navegador se vuelve a renderizar cuando el servidor responde, basado en el estado de las notas al inicio de esa operación de inserción. El problema se puede resolver "ralentizando" las operaciones de inserción usando el comando waitFor después de la inserción para esperar a que la nota insertada se renderice*/
}

const createUser = async (request, name, username, password) => {
  await request.post('/api/users', {
    data: {
      name: name,
      username: username,
      password: password,
    },
  })
}

const loginPageIsVisible = async (expect, page) => {
  await expect(page.getByText('Username')).toBeVisible()
  await expect(page.getByText('Password')).toBeVisible()
}

export { loginWith, createBlog, createUser, loginPageIsVisible }
