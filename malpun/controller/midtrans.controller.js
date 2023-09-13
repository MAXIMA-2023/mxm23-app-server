const env = require("dotenv").config({ path: "../../.env" });
const External = require("../../malpun/model/external.model");
const MalpunTransaction = require("../../malpun/model/malpun_transaction.model");
const { Model } = require("objection");
const { midtransCore, midtransSnap } = require("../../config/midtrans");

const paymentCallback = async (req, res) => {
  // wait for input alfagift ID
  // tanya ini API input alfagift sama sponsor pisah apa gabung
  const transaction = await Model.startTransaction();

  try {
    const payload = req.body;
    const { transaction_status, transaction_id } = payload;

    // paid
    console.log(transaction_status);
    if (transaction_status == "settlement") {
      // edit payment status on db
      const updateTransactionStatus = await MalpunTransaction.query()
        .where({
          id: "at2rxuknwb6c4kg5jmdlhp1ter7ll3aj",
        })
        .update({
          status: "settlement",
        });
      // on external table, update ticketBuyed to 1
      const updatePurchaseStatus = await External.query()
        .where({
          transactionID: "at2rxuknwb6c4kg5jmdlhp1ter7ll3aj",
        })
        .update({
          ticketBuyed: true,
        });
      // send email to user (according to token)

      transaction.commit();

      return res.status(200).json({
        status: "SUCCESS",
        type: "PAYMENT_SETTLEMENT",
        code: 200,
        message: "Pembayaran berhasil dilakukan.",
      });
    }

    // pending (user had chosen a payment method)
    if (transaction_status == "pending") {
      // edit payment status to pending
      const updateTransactionStatus = await MalpunTransaction.query()
        .where({
          id: "at2rxuknwb6c4kg5jmdlhp1ter7ll3aj",
        })
        .update({
          status: "pending",
        });

      transaction.commit();

      return res.status(200).json({
        status: "SUCCESS",
        type: "PAYMENT_PENDING",
        code: 200,
        message:
          "Pembayaran sedang dalam status pending / menunggu aksi dari user.",
      });
    }

    transaction.commit();
    return res.status(200).json({
      status: "SUCCESS",
      code: 200,
      message:
        "Berhasil melakukan pemrosesan pada payment dengan status " +
        transaction_status,
    });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    return res.status(500).send({
      code: 500,
      message: err.message,
    });
  }
};

module.exports = {
  paymentCallback,
};
