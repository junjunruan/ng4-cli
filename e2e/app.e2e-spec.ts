import { Ng4CliPage } from './app.po';

describe('ng4-cli App', () => {
  let page: Ng4CliPage;

  beforeEach(() => {
    page = new Ng4CliPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
