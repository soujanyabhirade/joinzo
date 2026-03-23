-- Wallet Schema for Joinzo Cash

-- 1. Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallets
CREATE POLICY "Users can view their own wallet"
    ON wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet balance"
    ON wallets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet"
    ON wallets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 2. Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL, -- positive for credit, negative for debit
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    description TEXT,
    reference_id TEXT, -- e.g., order_id, standard razorpay payment_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallet_transactions
CREATE POLICY "Users can view their own wallet transactions"
    ON wallet_transactions FOR SELECT
    USING (
        wallet_id IN (
            SELECT id FROM wallets WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own transactions"
    ON wallet_transactions FOR INSERT
    WITH CHECK (
        wallet_id IN (
            SELECT id FROM wallets WHERE user_id = auth.uid()
        )
    );

-- 3. Function to automatically create a wallet when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id, balance)
    VALUES (new.id, 0.00);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger to call the function on auth.users insert
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_wallet') THEN
    CREATE TRIGGER on_auth_user_created_wallet
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_wallet();
  END IF;
END $$;
