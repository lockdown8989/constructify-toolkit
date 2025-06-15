
-- Ensure the employees table has all the shift pattern columns with proper foreign key constraints
-- Check if columns exist and add them if they don't

-- Add shift pattern columns if they don't exist
DO $$ 
BEGIN
    -- Check and add shift_pattern_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'shift_pattern_id') THEN
        ALTER TABLE public.employees ADD COLUMN shift_pattern_id uuid;
    END IF;
    
    -- Check and add daily shift columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'monday_shift_id') THEN
        ALTER TABLE public.employees ADD COLUMN monday_shift_id uuid;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'tuesday_shift_id') THEN
        ALTER TABLE public.employees ADD COLUMN tuesday_shift_id uuid;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'wednesday_shift_id') THEN
        ALTER TABLE public.employees ADD COLUMN wednesday_shift_id uuid;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'thursday_shift_id') THEN
        ALTER TABLE public.employees ADD COLUMN thursday_shift_id uuid;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'friday_shift_id') THEN
        ALTER TABLE public.employees ADD COLUMN friday_shift_id uuid;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'saturday_shift_id') THEN
        ALTER TABLE public.employees ADD COLUMN saturday_shift_id uuid;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'sunday_shift_id') THEN
        ALTER TABLE public.employees ADD COLUMN sunday_shift_id uuid;
    END IF;
END $$;

-- Add foreign key constraints to ensure data integrity
DO $$
BEGIN
    -- Add foreign key constraints if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_shift_pattern') THEN
        ALTER TABLE public.employees 
        ADD CONSTRAINT fk_employees_shift_pattern 
        FOREIGN KEY (shift_pattern_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_monday_shift') THEN
        ALTER TABLE public.employees 
        ADD CONSTRAINT fk_employees_monday_shift 
        FOREIGN KEY (monday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_tuesday_shift') THEN
        ALTER TABLE public.employees 
        ADD CONSTRAINT fk_employees_tuesday_shift 
        FOREIGN KEY (tuesday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_wednesday_shift') THEN
        ALTER TABLE public.employees 
        ADD CONSTRAINT fk_employees_wednesday_shift 
        FOREIGN KEY (wednesday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_thursday_shift') THEN
        ALTER TABLE public.employees 
        ADD CONSTRAINT fk_employees_thursday_shift 
        FOREIGN KEY (thursday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_friday_shift') THEN
        ALTER TABLE public.employees 
        ADD CONSTRAINT fk_employees_friday_shift 
        FOREIGN KEY (friday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_saturday_shift') THEN
        ALTER TABLE public.employees 
        ADD CONSTRAINT fk_employees_saturday_shift 
        FOREIGN KEY (saturday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_employees_sunday_shift') THEN
        ALTER TABLE public.employees 
        ADD CONSTRAINT fk_employees_sunday_shift 
        FOREIGN KEY (sunday_shift_id) REFERENCES public.shift_patterns(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for better performance on shift pattern queries
CREATE INDEX IF NOT EXISTS idx_employees_shift_pattern_id ON public.employees(shift_pattern_id);
CREATE INDEX IF NOT EXISTS idx_employees_monday_shift_id ON public.employees(monday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_tuesday_shift_id ON public.employees(tuesday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_wednesday_shift_id ON public.employees(wednesday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_thursday_shift_id ON public.employees(thursday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_friday_shift_id ON public.employees(friday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_saturday_shift_id ON public.employees(saturday_shift_id);
CREATE INDEX IF NOT EXISTS idx_employees_sunday_shift_id ON public.employees(sunday_shift_id);
