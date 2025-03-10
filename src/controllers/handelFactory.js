const catchAsync = require("./../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeaturs");
const AppError = require("./../utils/appError");

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    
    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
exports.getOne = (Model, populate) =>
  catchAsync(async (req, res, next) => {
    let doc;
    if (populate) {
      doc = await Model.findById(req.params.id).populate(populate);
    } else {
      doc = await Model.findById(req.params.id);
    }

    if (!doc) {
      return next(new AppError("document not found with that Id", 404));
    }
    res.status(200).json({
      status: "success ",
      data: {
        data: doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("document not found with that Id", 404));
    }
    res.status(200).json({
      status: "success ",
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("document not found with that Id", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
