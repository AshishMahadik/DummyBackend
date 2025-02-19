const { viewService } = require('../services');
const { catchAsync } = require('../utils');

const emailBox = catchAsync(async (req, res, next) => {
  res.render('email-box');
});

const emailList = catchAsync(async (req, res, next) => {
  const emails = await viewService.emailList(
    { to: req.params.email },
    { sortBy: '-createdAt' },
  );

  let isAvail = true;
  if (emails.length !== 0) {
    isAvail = false;
  } else {
    isAvail = true;
  }

  res.render('email-list', {
    emails: emails.results,
    isAvail,
    loginEmail: req.params.email,
  });
});

const emailView = catchAsync(async (req, res, next) => {
  const email = await viewService.emailView(req.params.id);
  res.render('email-view', { email });
});

module.exports = {
  emailBox,
  emailList,
  emailView,
};
