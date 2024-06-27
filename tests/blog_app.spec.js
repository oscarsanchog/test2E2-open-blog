const { test, expect, describe, beforeEach } = require('@playwright/test')
const {
  loginWith,
  createBlog,
  createUser,
  loginPageIsVisible,
} = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await createUser(request, 'Matti Luukkainen', 'mluukkai', 'salainen')
    await page.goto('/')
  })

  test('Front page can be opened', async ({ page }) => {
    const locator = page.getByText('Blogs')
    await expect(locator).toBeVisible()
    await loginPageIsVisible(expect, page)
  })

  test('login fails with wrong password', async ({ page }) => {
    await loginWith(page, 'mluukkai', 'wrong')
    const errorDiv = page.locator('.error')
    await expect(errorDiv).toContainText('Invalid username or password')
    await expect(page.getByText('User: Matti Luukkainen')).not.toBeVisible()
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page) //await page.getByRole('button', { name: 'Login' }).click()

      /* const textboxes = await page.getByRole('textbox').all()
    await textboxes[0].fill('mluukkai')
    await textboxes[1].fill('salainen') */

      /* await page.getByRole('textbox').first().fill('oscarsanchog')
      await page.getByRole('textbox').last().fill('108217San') */
    })
    test('Login form can be opened and a user can login', async ({ page }) => {
      await expect(page.getByText('User: Matti Luukkainen')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'A blog created by playwright')
      await expect(page.getByText('A blog created by playwright')).toBeVisible()
    })

    describe('When blogs are already created', async () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'First blog')
        await createBlog(page, 'Second blog')
      })

      test('User can click to the like button and it functions', async ({
        page,
      }) => {
        await page.getByRole('button', { name: 'View' }).first().click()
        const likesSpan = page.getByTestId('likes')
        const initialLikes = await likesSpan.innerText()
        await page.getByRole('button', { name: '❤️' }).click()
        await expect(likesSpan).toHaveText(
          (parseInt(initialLikes) + 1).toString()
        )
      })

      test('User can delete a blog', async ({ page }) => {
        page.on('dialog', (dialog) => dialog.accept())
        await page.getByRole('button', { name: 'Delete' }).first().click()
        await expect(page.getByText('First blog')).not.toBeVisible()
      })

      test("A user cannot delete a blog that was not created by them", async ({
        page,
        request,
      }) => {
        const newUser = {
          name: 'Óscar Sancho',
          username: 'oscarsanchog',
          password: '1234osc',
        }
        await page.getByRole('button', { name: 'Logout' }).click()
        await loginPageIsVisible(expect, page)

        await createUser(
          request,
          newUser.name,
          newUser.username,
          newUser.password
        )

        await loginWith(page, newUser.username, newUser.password)
        await expect(page.getByText(`User: ${newUser.name}`)).toBeVisible()
        await expect(
          page.getByRole('button', { name: 'Delete' })
        ).not.toBeVisible()
      })

      test('The order of the blogs is from largest to smallest, according to their likes', async ({
        page,
      }) => {
        await page.getByRole('button', { name: 'View' }).last().click()
        const likesSpan = page.getByTestId('likes')
        const initialLikes = await likesSpan.innerText()
        await page.getByRole('button', { name: '❤️' }).click()
        await expect(likesSpan).toHaveText(
          (parseInt(initialLikes) + 1).toString()
        )

        const blogs =  page.locator('.blog')
        const firstBlogText = await blogs.nth(0).innerText();
        const secondBlogText = await blogs.nth(1).innerText();
         expect(firstBlogText).toContain('Second blog');
        expect(secondBlogText).toContain('First blog');


      })
    })
  })
})
