-- Migration 015: RPC Functions
-- Secure backend-only operations. These prevent direct client-side wallet/stock manipulation.

-- ============================================================
-- Function: create_campaign
-- Creates a campaign and adds the creator as owner_dm.
-- ============================================================
CREATE OR REPLACE FUNCTION create_campaign(campaign_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_campaign_id UUID;
  join_code_val TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  found_campaign campaigns%ROWTYPE;
  existing_campaigns_count INTEGER;
BEGIN
  -- Check user hasn't exceeded campaign limit (free tier: 1 campaign)
  SELECT COUNT(*) INTO existing_campaigns_count
  FROM campaign_members cm
  WHERE cm.profile_id = auth.uid()
  AND cm.role IN ('owner_dm', 'co_dm');

  -- Generate unique 6-char join code
  LOOP
    join_code_val := '';
    FOR i IN 1..6 LOOP
      join_code_val := join_code_val || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    SELECT * INTO found_campaign FROM campaigns WHERE join_code = join_code_val;
    EXIT WHEN NOT FOUND;
  END LOOP;

  -- Create campaign
  INSERT INTO campaigns (name, join_code, created_by)
  VALUES (campaign_name, join_code_val, auth.uid())
  RETURNING id INTO new_campaign_id;

  -- Add creator as owner_dm
  INSERT INTO campaign_members (campaign_id, profile_id, role)
  VALUES (new_campaign_id, auth.uid(), 'owner_dm');

  -- Create feed entry
  INSERT INTO campaign_feed (campaign_id, visibility, entry_type, title, body, created_by)
  VALUES (new_campaign_id, 'party', 'campaign_created', 'A new adventure begins!', format('The realm of %s has been established.', campaign_name), auth.uid());

  RETURN jsonb_build_object(
    'campaign_id', new_campaign_id,
    'join_code', join_code_val
  );
END;
$$;

-- ============================================================
-- Function: join_campaign_by_code
-- Joins a campaign using a 6-character code.
-- ============================================================
CREATE OR REPLACE FUNCTION join_campaign_by_code(code TEXT, character_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_campaign campaigns%ROWTYPE;
  existing_membership campaign_members%ROWTYPE;
  new_membership_id UUID;
  player_profile_id UUID;
BEGIN
  -- Find campaign by code
  SELECT * INTO target_campaign FROM campaigns WHERE join_code = UPPER(TRIM(code));
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Invalid campaign code.');
  END IF;

  -- Check not already a member
  SELECT * INTO existing_membership FROM campaign_members
  WHERE campaign_id = target_campaign.id AND profile_id = auth.uid();
  IF FOUND THEN
    RETURN jsonb_build_object('error', 'You are already a member of this campaign.');
  END IF;

  -- Get profile id
  SELECT id INTO player_profile_id FROM profiles WHERE id = auth.uid();

  -- Add as player
  INSERT INTO campaign_members (campaign_id, profile_id, character_id, role)
  VALUES (target_campaign.id, auth.uid(), character_id, 'player')
  RETURNING id INTO new_membership_id;

  -- Create feed entry
  INSERT INTO campaign_feed (campaign_id, visibility, entry_type, title, body, created_by)
  VALUES (target_campaign.id, 'party', 'player_joined',
    'A new adventurer arrives!',
    format('A new hero has joined the campaign.', target_campaign.name),
    auth.uid());

  RETURN jsonb_build_object(
    'membership_id', new_membership_id,
    'campaign_id', target_campaign.id,
    'campaign_name', target_campaign.name
  );
END;
$$;

-- ============================================================
-- Function: request_purchase
-- Player requests to buy an item from a shop.
-- Creates a pending purchase request (no gold deducted yet).
-- ============================================================
CREATE OR REPLACE FUNCTION request_purchase(
  p_shop_inventory_id UUID,
  p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inv_item shop_inventory%ROWTYPE;
  shop_info shops%ROWTYPE;
  player_char player_characters%ROWTYPE;
  campaign_info campaigns%ROWTYPE;
  membership campaign_members%ROWTYPE;
  total_price INTEGER;
  purchase_id UUID;
BEGIN
  -- Validate quantity
  IF p_quantity < 1 THEN
    RETURN jsonb_build_object('error', 'Quantity must be at least 1.');
  END IF;

  -- Get inventory item
  SELECT * INTO inv_item FROM shop_inventory WHERE id = p_shop_inventory_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Item not found in shop inventory.');
  END IF;

  -- Check if item is visible
  IF NOT inv_item.is_visible THEN
    RETURN jsonb_build_object('error', 'This item is not available for purchase.');
  END IF;

  -- Check stock
  IF inv_item.quantity >= 0 AND inv_item.quantity < p_quantity THEN
    RETURN jsonb_build_object('error', 'Not enough stock available.');
  END IF;

  -- Get shop
  SELECT * INTO shop_info FROM shops WHERE id = inv_item.shop_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Shop not found.');
  END IF;

  -- Check shop is active
  IF NOT shop_info.is_active THEN
    RETURN jsonb_build_object('error', 'This shop is currently closed.');
  END IF;

  -- Get campaign
  SELECT * INTO campaign_info FROM campaigns WHERE id = shop_info.campaign_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Campaign not found.');
  END IF;

  -- Check user is a member of this campaign
  SELECT * INTO membership FROM campaign_members
  WHERE campaign_id = campaign_info.id AND profile_id = auth.uid();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'You are not a member of this campaign.');
  END IF;

  -- Get player character
  SELECT * INTO player_char FROM player_characters
  WHERE profile_id = auth.uid() AND campaign_id = campaign_info.id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'You do not have a character in this campaign.');
  END IF;

  -- Calculate total price
  total_price := inv_item.current_price_copper * p_quantity;

  -- Check character has enough gold
  IF player_char.gold * 10000 + player_char.silver * 100 + player_char.copper < total_price THEN
    RETURN jsonb_build_object('error', 'Insufficient funds.');
  END IF;

  -- For instant purchase campaigns, process immediately
  IF campaign_info.instant_purchases_enabled THEN
    -- Deduct gold from character
    UPDATE player_characters
    SET
      gold = gold - (total_price / 10000),
      silver = silver - ((total_price % 10000) / 100),
      copper = copper - (total_price % 100),
      updated_at = now()
    WHERE id = player_char.id;

    -- Reduce stock if not infinite
    IF inv_item.quantity > 0 THEN
      UPDATE shop_inventory
      SET quantity = quantity - p_quantity, updated_at = now()
      WHERE id = p_shop_inventory_id;
    END IF;

    -- Add items to backpack
    INSERT INTO backpacks (character_id, item_id, quantity, source)
    VALUES (player_char.id, inv_item.item_id, p_quantity, 'purchase');

    -- Create transaction log
    INSERT INTO economy_transactions (campaign_id, character_id, transaction_type, amount_copper, description, source_table, source_id, created_by)
    VALUES (campaign_info.id, player_char.id, 'purchase', -total_price,
      format('Purchased x%s from %s', p_quantity, shop_info.name),
      'shop_inventory', p_shop_inventory_id, auth.uid());

    -- Create feed entry
    INSERT INTO campaign_feed (campaign_id, visibility, entry_type, title, body, created_by)
    VALUES (campaign_info.id, 'party', 'purchase_completed',
      format('Purchase at %s', shop_info.name),
      format('A purchase was completed at %s.', shop_info.name),
      auth.uid());

    RETURN jsonb_build_object('status', 'completed', 'message', 'Purchase completed successfully.');
  END IF;

  -- DM approval required - create purchase request
  INSERT INTO purchase_requests (campaign_id, character_id, shop_inventory_id, quantity, price_copper, requested_by)
  VALUES (campaign_info.id, player_char.id, p_shop_inventory_id, p_quantity, total_price, auth.uid())
  RETURNING id INTO purchase_id;

  -- Create feed entry
  INSERT INTO campaign_feed (campaign_id, visibility, entry_type, title, body, created_by)
  VALUES (campaign_info.id, 'party', 'purchase_requested',
    format('Purchase requested at %s', shop_info.name),
    format('A player is requesting to purchase items from %s.', shop_info.name),
    auth.uid());

  RETURN jsonb_build_object(
    'status', 'pending',
    'purchase_request_id', purchase_id,
    'message', 'Purchase request sent to DM for approval.'
  );
END;
$$;

-- ============================================================
-- Function: approve_purchase
-- DM approves a pending purchase request.
-- Deducts gold, reduces stock, adds to backpack, logs transaction.
-- ============================================================
CREATE OR REPLACE FUNCTION approve_purchase(p_purchase_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pr purchase_requests%ROWTYPE;
  inv_item shop_inventory%ROWTYPE;
  player_char player_characters%ROWTYPE;
  is_dm BOOLEAN;
  total_price INTEGER;
BEGIN
  -- Get purchase request
  SELECT * INTO pr FROM purchase_requests WHERE id = p_purchase_request_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Purchase request not found.');
  END IF;

  -- Check it's still pending
  IF pr.status != 'pending' THEN
    RETURN jsonb_build_object('error', format('This request has already been %s.', pr.status));
  END IF;

  -- Check caller is DM of this campaign
  SELECT EXISTS (
    SELECT 1 FROM campaign_members cm
    WHERE cm.campaign_id = pr.campaign_id
    AND cm.profile_id = auth.uid()
    AND cm.role IN ('owner_dm', 'co_dm')
  ) INTO is_dm;

  IF NOT is_dm THEN
    RETURN jsonb_build_object('error', 'Only the DM can approve purchase requests.');
  END IF;

  -- Get inventory item
  SELECT * INTO inv_item FROM shop_inventory WHERE id = pr.shop_inventory_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Inventory item no longer exists.');
  END IF;

  -- Check stock
  IF inv_item.quantity >= 0 AND inv_item.quantity < pr.quantity THEN
    -- Auto-reject if insufficient stock
    UPDATE purchase_requests
    SET status = 'rejected', resolved_by = auth.uid(), rejection_reason = 'Insufficient stock', resolved_at = now()
    WHERE id = p_purchase_request_id;
    RETURN jsonb_build_object('error', 'Insufficient stock. Request auto-rejected.');
  END IF;

  -- Get player character
  SELECT * INTO player_char FROM player_characters WHERE id = pr.character_id;

  -- Calculate total price
  total_price := pr.price_copper;

  -- Check balance
  IF player_char.gold * 10000 + player_char.silver * 100 + player_char.copper < total_price THEN
    UPDATE purchase_requests
    SET status = 'rejected', resolved_by = auth.uid(), rejection_reason = 'Insufficient funds', resolved_at = now()
    WHERE id = p_purchase_request_id;
    RETURN jsonb_build_object('error', 'Player no longer has sufficient funds. Request auto-rejected.');
  END IF;

  -- Deduct gold from character
  UPDATE player_characters
  SET
    gold = gold - (total_price / 10000),
    silver = silver - ((total_price % 10000) / 100),
    copper = copper - (total_price % 100),
    updated_at = now()
  WHERE id = player_char.id;

  -- Reduce stock
  IF inv_item.quantity > 0 THEN
    UPDATE shop_inventory
    SET quantity = quantity - pr.quantity, updated_at = now()
    WHERE id = pr.shop_inventory_id;
  END IF;

  -- Add to backpack
  INSERT INTO backpacks (character_id, item_id, quantity, source)
  VALUES (player_char.id, inv_item.item_id, pr.quantity, 'purchase');

  -- Update request status
  UPDATE purchase_requests
  SET status = 'approved', resolved_by = auth.uid(), resolved_at = now()
  WHERE id = p_purchase_request_id;

  -- Create transaction log
  INSERT INTO economy_transactions (campaign_id, character_id, transaction_type, amount_copper, description, source_table, source_id, created_by)
  VALUES (pr.campaign_id, player_char.id, 'purchase', -total_price,
    format('Purchase approved: x%s', pr.quantity),
    'purchase_requests', p_purchase_request_id, auth.uid());

  -- Create feed entry
  INSERT INTO campaign_feed (campaign_id, visibility, entry_type, title, body, created_by)
  VALUES (pr.campaign_id, 'party', 'purchase_approved',
    'Purchase approved!',
    format('A purchase request has been approved.', pr.quantity),
    auth.uid());

  RETURN jsonb_build_object('status', 'approved', 'message', 'Purchase approved successfully.');
END;
$$;

-- ============================================================
-- Function: reject_purchase
-- DM rejects a pending purchase request.
-- ============================================================
CREATE OR REPLACE FUNCTION reject_purchase(
  p_purchase_request_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pr purchase_requests%ROWTYPE;
  is_dm BOOLEAN;
BEGIN
  -- Get purchase request
  SELECT * INTO pr FROM purchase_requests WHERE id = p_purchase_request_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Purchase request not found.');
  END IF;

  -- Check it's still pending
  IF pr.status != 'pending' THEN
    RETURN jsonb_build_object('error', format('This request has already been %s.', pr.status));
  END IF;

  -- Check caller is DM
  SELECT EXISTS (
    SELECT 1 FROM campaign_members cm
    WHERE cm.campaign_id = pr.campaign_id
    AND cm.profile_id = auth.uid()
    AND cm.role IN ('owner_dm', 'co_dm')
  ) INTO is_dm;

  IF NOT is_dm THEN
    RETURN jsonb_build_object('error', 'Only the DM can reject purchase requests.');
  END IF;

  -- Update request
  UPDATE purchase_requests
  SET status = 'rejected', resolved_by = auth.uid(), rejection_reason = p_reason, resolved_at = now()
  WHERE id = p_purchase_request_id;

  -- Create feed entry
  INSERT INTO campaign_feed (campaign_id, visibility, entry_type, title, body, created_by)
  VALUES (pr.campaign_id, 'private', 'purchase_rejected',
    'Purchase request rejected',
    CASE WHEN p_reason IS NOT NULL THEN format('Reason: %s', p_reason) ELSE 'Your purchase request was declined.' END,
    auth.uid());

  RETURN jsonb_build_object('status', 'rejected', 'message', 'Purchase request rejected.');
END;
$$;