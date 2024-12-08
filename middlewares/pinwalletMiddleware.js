const validatePIN = async (req, res, next) => {
    const { userId, PIN } = req.body;
  
    try {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
  
      if (wallet.PIN !== PIN) {
        return res.status(401).json({ error: "Invalid PIN" });
      }
  
      next();
    } catch (error) {
      res.status(500).json({ error: "Failed to validate PIN" });
    }
  };
  

  